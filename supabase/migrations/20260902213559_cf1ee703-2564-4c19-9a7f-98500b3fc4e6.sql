REVOKE ALL ON FUNCTION public.expire_stale_meetings() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.expire_stale_meetings() TO authenticated, service_role;