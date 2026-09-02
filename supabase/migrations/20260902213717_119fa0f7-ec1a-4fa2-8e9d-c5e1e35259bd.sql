REVOKE ALL ON FUNCTION public.expire_stale_meetings() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.expire_stale_meetings() TO service_role;