-- create type tiers as enum ('anonymous', 'registered', 'premium');

insert into public.tier_descriptions (name, max_files, formats, mic_length, adv_ratio)
values  ('anonymous', 5, '{mp3,webm}', 150, 5),
        ('registered', 40, '{mp3,webm,wav,flac}', 600, 1),
        ('premium', 120, '{mp3,webm,wav,flac,ogg,wma,aac}', 3600, 0);