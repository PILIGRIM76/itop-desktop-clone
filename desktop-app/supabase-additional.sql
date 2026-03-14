-- Дополнительные индексы для производительности
create index license_keys_used_by_idx on license_keys(used_by);
create index license_keys_is_used_idx on license_keys(is_used);

-- Ограничения целостности
alter table license_keys 
add constraint check_duration_positive check (duration_days > 0);

alter table license_keys 
add constraint check_activated_when_used 
check (is_used = false or activated_at is not null);
