\echo "Delete and recreate user/stats db?"
\prompt "Return for yes or control-C to cancel >" foo

DROP DATABASE war_cards;
CREATE DATABASE war_cards;
\connect war_cards

\i war-schema.sql

DROP DATABASE war_cards_test;
CREATE DATABASE war_cards_test;
\connect war_cards_test

\i war-schema.sql
