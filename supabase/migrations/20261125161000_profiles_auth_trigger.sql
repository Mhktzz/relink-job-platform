ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS onboarding_complete BOOLEAN DEFAULT FALSE;

CREATE OR REPLACE FUNCTION public.handle_new_auth_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (
    id,
    user_id,
    full_name,
    phone,
    role,
    tier,
    business_name,
    trust_score,
    is_verified,
    onboarding_complete
  )
  VALUES (
    NEW.id,
    NEW.id,
    COALESCE(
      NULLIF(NEW.raw_user_meta_data ->> 'full_name', ''),
      NULLIF(split_part(COALESCE(NEW.email, ''), '@', 1), ''),
      'Pengguna'
    ),
    NULLIF(NEW.raw_user_meta_data ->> 'phone', ''),
    CASE
      WHEN NEW.raw_user_meta_data ->> 'role' = 'mitra' THEN 'mitra'
      ELSE 'klien'
    END,
    'Tier 1',
    NULLIF(NEW.raw_user_meta_data ->> 'business_name', ''),
    0,
    FALSE,
    FALSE
  )
  ON CONFLICT (id) DO NOTHING;

  RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION public.handle_new_auth_user() FROM PUBLIC, anon, authenticated;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_auth_user();

INSERT INTO public.profiles (
  id,
  user_id,
  full_name,
  phone,
  role,
  tier,
  business_name,
  trust_score,
  is_verified,
  onboarding_complete
)
SELECT
  auth_user.id,
  auth_user.id,
  COALESCE(
    NULLIF(auth_user.raw_user_meta_data ->> 'full_name', ''),
    NULLIF(split_part(COALESCE(auth_user.email, ''), '@', 1), ''),
    'Pengguna'
  ),
  NULLIF(auth_user.raw_user_meta_data ->> 'phone', ''),
  CASE
    WHEN auth_user.raw_user_meta_data ->> 'role' = 'mitra' THEN 'mitra'
    ELSE 'klien'
  END,
  'Tier 1',
  NULLIF(auth_user.raw_user_meta_data ->> 'business_name', ''),
  0,
  FALSE,
  FALSE
FROM auth.users AS auth_user
LEFT JOIN public.profiles AS profile ON profile.id = auth_user.id
WHERE profile.id IS NULL
ON CONFLICT (id) DO NOTHING;
