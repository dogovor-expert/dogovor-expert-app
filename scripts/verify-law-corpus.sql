\echo '=== law_chunks columns ==='
select column_name from information_schema.columns where table_schema='public' and table_name='law_chunks' order by ordinal_position;
\echo '=== law_document_editions columns ==='
select column_name from information_schema.columns where table_schema='public' and table_name='law_document_editions' order by ordinal_position;
\echo '=== match_law_chunks signature ==='
select p.proname, pg_get_function_result(p.oid) from pg_proc p join pg_namespace n on n.oid=p.pronamespace where n.nspname='public' and p.proname='match_law_chunks';
\echo '=== reload postgrest schema cache ==='
NOTIFY pgrst, 'reload schema';
\echo '=== counts ==='
select (select count(*) from public.law_documents) as docs, (select count(*) from public.law_document_editions) as editions, (select count(*) from public.law_chunks) as chunks;
