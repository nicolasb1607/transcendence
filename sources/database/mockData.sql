-- Create Mock Users
-- Password should be hashed
INSERT INTO public."User" ("ID", "login", "password", "email", "status", "role")
VALUES
	(1, 'Baptiste', '$2a$10$SIRCZIP2wU0qAi/V0cHNo..dP2pnNM/qKam73TpDRYaMVfw2DXER6', 'bboisset@student.42.fr', 'offline', 'admin'),
	(2, 'user2', '$2a$10$SIRCZIP2wU0qAi/V0cHNo..dP2pnNM/qKam73TpDRYaMVfw2DXER6', 'user2@example.com', 'offline', 'moderator'),
	(3, 'user3', 'password3', 'user3@example.com', 'offline', 'user'),
	(4, 'user4', 'password4', 'user4@example.com', 'offline', 'user'),
	(5, 'user5', 'password5', 'user5@example.com', 'offline', 'user'),
	(6, 'user6', 'password6', 'user6@example.com', 'offline', 'user'),
	(7, 'user7', 'password7', 'rodolphegamer@hotmail.fr', 'offline', 'user'),
	(8, 'user8', 'password8', 'user8@example.com', 'offline', 'user'),
	(9, 'user9', 'password9', 'user9@example.com', 'offline', 'user'),
	(10, 'user10', 'password10', 'user10@example.com', 'offline', 'user'),
	(11, 'user11', 'password11', 'user11@example.com', 'offline', 'user');
	
	
-- Create Mock User Data
INSERT INTO public."UserMeta" ("user_id", "meta_key", "meta_value")
VALUES
	(1, 'avatar', 'avatars/public/order_avatar1.jpg'),
	(2, 'avatar', 'avatars/public/alliance_avatar2.jpg'),
	(3, 'avatar', 'avatars/public/alliance_avatar4.jpg'),
	(4, 'avatar', 'avatars/public/avatar5.jpg'),
	(5, 'avatar', 'avatars/public/avatar3.jpg'),
	(6, 'avatar', 'avatars/public/avatar6.jpg'),
	(7, 'avatar', 'avatars/public/avatar9.jpg'),
	(8, 'avatar', 'avatars/public/avatar1.jpg'),
	(9, 'avatar', 'avatars/public/avatar4.jpg'),
	(10, 'avatar', 'avatars/public/avatar7.jpg'),
	(11, 'avatar', 'avatars/public/avatar5.jpg'),
	(1, 'experience', '{"level":29,"exp":40}'),
	(2, 'experience', '{"level":23,"exp":20}'),
	(3, 'experience', '{"level":16,"exp":10}'),
	(5, 'experience', '{"level":22,"exp":10}'),
	(6, 'experience', '{"level":22,"exp":10}'),
	(7, 'experience', '{"level":22,"exp":10}'),
	(8, 'experience', '{"level":22,"exp":10}'),
	(9, 'experience', '{"level":22,"exp":10}'),
	(10, 'experience', '{"level":22,"exp":10}'),
	(11, 'experience', '{"level":22,"exp":10}'),
	(4, 'experience', '{"level":14,"exp":10}');

-- Create main Channel
INSERT INTO public."Channel" ("ID", "name", "type", "owner_id", "created_at", "password", "image")
VALUES
	(1, 'Main Canal', 'general', 0, '2023-06-01 00:00:00', NULL, 'blue_lizards.jpg'),
	(2, 'Stellar Pong Syndicate', 'private', 1, '2015-03-02 16:00:00', NULL, 'red_lizards3.jpg'),
	(3, 'Space Pong team', 'public', 2, '2015-03-02 16:00:00', NULL, 'red_lizards4.jpg'),
	(4, 'Galactic Pong Titan', 'public', 1, '2015-03-02 16:00:00', NULL, 'blue_lizards2.jpg'),
	(5, 'Zero-G Racketeers', 'public', 2, '2015-03-02 16:00:00', NULL, 'purple.jpg'),
	(6, 'Celestial Ball Brawlers', 'public', 1, '2015-03-02 16:00:00', NULL, 'blue_lizards.jpg'),
	(7, 'Nebula Pong Masters', 'public', 1, '2015-03-02 16:00:00', NULL, 'yellow_blue_lizards.jpg'),
	(8, 'Cosmic Astronaut Pongers', 'public', 1, '2023-07-20 00:00:00', NULL, 'blue_lizards3.jpg'),
	(9, 'Interstellar Smashers', 'public', 1, '2023-07-20 00:00:00', NULL, 'red_lizards.jpg'),
	(10, 'Astronautic Ball Blazers', 'public', 1, '2023-07-20 00:00:00', NULL, 'yellow_group.jpg'),
	(11, 'Pongonautic Challengers', 'public', 1, '2023-07-20 00:00:00', NULL, 'green_monkeys.jpg'),
	(12, 'Zero-G Astronaut Pongers', 'public', 1, '2023-07-20 00:00:00', NULL, 'purple_lizards2.jpg'),
	(13, 'Private Canal (1, 2)','conversation', 1, '2023-06-01 00:00:00', NULL, ''),
	(14, 'Private Canal (3, 4)', 'conversation', 3, '2023-06-01 00:00:00', NULL, ''),
	(15, 'Private Canal (3, 5)', 'conversation', 5, '2023-06-01 00:00:00', NULL, ''),
	(16, 'Protected Channel', 'protected', 1, '2023-06-01 00:00:00', '$2a$10$zMCvS/ReKlvzFw2pLkYCxuOuZTWlV7ftzoUf6vZK/ntXzpvIeWuse', 'red_lizards2.jpg');

-- Create users inside channels
INSERT INTO public."UserChannel" ("user_id", "channel_id", "created_at", "is_confirmed", "role")
VALUES
	(2, 3, '2023-07-20 00:00:00', true, 'admin'),
	(2, 4, '2023-07-20 00:00:00', true, 'user'),
	(2, 5, '2023-07-20 00:00:00', true, 'user'),
	(3, 3, '2023-07-20 00:00:00', true, 'user'),
	(3, 4, '2023-07-20 00:00:00', true, 'user'),
	(3, 12, '2023-07-20 00:00:00', true, 'user'),
	(4, 3, '2023-07-20 00:00:00', true, 'user'),
	(4, 4, '2023-07-20 00:00:00', true, 'user'),
	(5, 3, '2023-07-20 00:00:00', true, 'user'),
	(5, 4, '2023-07-20 00:00:00', true, 'user'),
	(6, 3, '2023-07-20 00:00:00', true, 'user'),
	(6, 4, '2023-07-20 00:00:00', true, 'user'),
	(7, 3, '2023-07-20 00:00:00', true, 'user'),
	(7, 4, '2023-07-20 00:00:00', true, 'user'),
	(8, 3, '2023-07-20 00:00:00', true, 'user'),
	(8, 4, '2023-07-20 00:00:00', true, 'user'),
	(9, 3, '2023-07-20 00:00:00', true, 'user'),
	(9, 4, '2023-07-20 00:00:00', true, 'user'),
	(10, 3, '2023-07-20 00:00:00', true, 'user'),
	(1, 13, '2023-07-20 00:00:00', true, 'admin'),
	(3, 14, '2023-07-20 00:00:00', true, 'admin'),
	(5, 15, '2023-07-20 00:00:00', true, 'admin'),
	(2, 13, '2023-07-20 00:00:00', true, 'user'),
	(4, 14, '2023-07-20 00:00:00', true, 'user'),
	(6, 15, '2023-07-20 00:00:00', true, 'user'),
	(1, 1, '2023-07-20 00:00:00', true, 'admin'),
	(2, 1, '2023-07-20 00:00:00', true, 'admin'),
	(3, 1, '2023-07-20 00:00:00', true, 'user'),
	(4, 1, '2023-07-20 00:00:00', true, 'user'),
	(5, 1, '2023-07-20 00:00:00', true, 'user');
	
-- Insertion of Messages and MessageRecipients for the Pong game
INSERT INTO public."Message" ("ID", "emitter_id", "channel_id","content", "created_at")
VALUES
    (1, 2, 1, 'Premier message sur le jeu de pong', '2023-06-01 00:00:00'),
    (2, 3, 1, 'Le jeu de pong est amusant', '2023-06-01 01:00:00'),
    (3, 4, 1, 'Qui veut jouer au pong ?', '2023-06-01 02:00:00'),
    (4, 1, 1, 'Je suis un pro du pong', '2023-06-01 03:00:00'),
    (5, 4, 1, 'Ping-pong !', '2023-06-01 04:00:00'),
    (6, 3, 1, 'Je viens de gagner une partie de pong', '2023-06-01 05:00:00'),
    (7, 3, 1, 'Le pong est mon jeu préféré', '2023-06-01 06:00:00'),
    (8, 2, 1, 'Jouons au pong ensemble', '2023-06-01 07:00:00'),
    (9, 4, 1, 'Pong, pong, pong !', '2023-06-01 08:00:00'),
    (10, 4, 0, 'Je défie tous les joueurs de pong', '2023-06-01 09:00:00'),
    (11, 3, 0, 'Vive le jeu de pong', '2023-06-01 10:00:00'),
    (12, 4, 0, 'Je veux jouer au pong aussi', '2023-06-01 11:00:00'),
    (13, 3, 0, 'Le pong est un sport formidable', '2023-06-01 12:00:00'),
    (14, 3, 0, 'Je viens d''acheter une nouvelle raquette de pong', '2023-06-01 13:00:00'),
    (15, 2, 0, 'Prêt pour un match de pong ?', '2023-06-01 14:00:00'),
    (16, 1, 0, 'Je m''entraîne tous les jours au pong', '2023-06-01 15:00:00'),
    (17, 4, 0, 'Ping-pong, le meilleur jeu de tous les temps', '2023-06-01 16:00:00'),
    (18, 3, 0, 'Je suis le champion de pong de mon quartier', '2023-06-01 17:00:00'),
    (19, 2, 0, 'Le pong me passionne', '2023-06-01 18:00:00'),
    (20, 1, 0, 'Je suis impatient de jouer au pong avec vous', '2023-06-01 19:00:00'),
    (21, 4, 0, 'Qui veut jouer une partie de pong ?', '2023-06-01 20:00:00'),
    (22, 3, 0, 'Le pong est un excellent moyen de se divertir', '2023-06-01 21:00:00'),
    (23, 3, 0, 'Je cherche un partenaire de pong', '2023-06-01 22:00:00'),
    (24, 4, 0, 'Le pong renforce la coordination', '2023-06-01 23:00:00'),
    (25, 3, 0, 'Ping ! Pong !', '2023-06-02 00:00:00'),
    (26, 4, 0, 'J''adore jouer au pong en plein air', '2023-06-02 01:00:00'),
    (27, 4, 0, 'Le pong est un jeu stimulant', '2023-06-02 02:00:00'),
    (28, 3, 0, 'Je cherche des adversaires de pong', '2023-06-02 03:00:00'),
    (29, 3, 0, 'Le pong améliore la concentration', '2023-06-02 04:00:00'),
    (30, 4, 0, 'Ping-pong ! Qui veut jouer ?', '2023-06-02 05:00:00'),
    (31, 3, 3, 'Hello, how are you?', '2023-06-02 06:00:00'),
    (32, 4, 3, 'I''m good, thanks! How about you?', '2023-06-02 07:00:00'),
    (33, 3, 3, 'I''m doing great!', '2023-06-02 08:00:00'),
    (34, 4, 3, 'That''s awesome!', '2023-06-02 09:00:00'),
    (35, 3, 3, 'Do you want to play pong later?', '2023-06-02 10:00:00'),
    (36, 4, 3, 'Sure, I''d love to!', '2023-06-02 11:00:00'),
    (37, 3, 3, 'Great! Let''s meet at the pong table at 3 PM.', '2023-06-02 12:00:00'),
    (38, 4, 3, 'Sounds good! See you then.', '2023-06-02 13:00:00'),
    (39, 3, 4, 'Do you want to play pong later?', '2023-06-02 10:00:00'),
    (40, 5, 4, 'Sure, I''d love to!', '2023-06-02 11:00:00'),
    (41, 3, 4, 'Great! Let''s meet at the pong table at 3 PM.', '2023-06-02 12:00:00'),
    (42, 5, 4, 'Sounds good! See you then.', '2023-06-02 13:00:00'),
	(43, 3, 2, 'Hello buddy, are you up to play a new game ?', '2023-06-02 13:00:00'),
	(44, 1, 13, 'Sure, I''d love to!','2023-07-27 13:00:00');

-- Insertion of User achievements
INSERT INTO public."UserAchievement" ("ID", "user_id", "achievement_id", "achieved_at")
VALUES
	(1, 1, 1, '2023-06-01 22:00:00'),
	(2, 1, 2, '2023-06-01 22:00:00'),
	(3, 1, 3, '2023-06-01 22:00:00'),
	(4, 1, 17, '2023-06-01 22:00:00'),
	(5, 1, 18, '2023-06-01 22:00:00'),
	(6, 1, 19, '2023-06-01 22:00:00'),
	(7, 1, 4, '2023-06-01 22:00:00'),
	(8, 1, 5, '2023-06-01 22:00:00'),
	(9, 1, 6, '2023-06-01 22:00:00'),
	(10, 1, 15, '2023-06-01 22:00:00'),
	(11, 1, 7, '2023-06-01 22:00:00'),
	(12, 1, 8, '2023-06-01 22:00:00'),
	(13, 1, 9, '2023-06-01 22:00:00'),
	(14, 1, 12, '2023-06-01 22:00:00'),
	(15, 1, 13, '2023-06-01 22:00:00'),
	(16, 1, 14, '2023-06-01 22:00:00'),
	(17, 1, 11, '2023-06-01 22:00:00'),
	(18, 1, 24, '2023-06-01 22:00:00');

INSERT INTO public."Game" ("ID","type", "players","created_at","updated_at","duration","winner_id","score")
VALUES
	(1, 'classicPong', ARRAY[1, 2], '2023-06-01 22:00:00', '2023-06-01 22:04:00', 250, 1, ARRAY[5, 4]),
	(2, 'classicPong', ARRAY[2, 3], '2023-06-01 22:04:00', '2023-06-01 22:08:00', 250, 2, ARRAY[5, 4]),
	(3, 'classicPong', ARRAY[2, 3], '2023-06-01 22:08:00', '2023-06-01 22:12:00', 250, 3, ARRAY[2, 5]),
	(4, 'classicPong', ARRAY[2, 3], '2023-06-01 22:12:00', '2023-06-01 22:16:00', 250, 3, ARRAY[3, 5]),
	(5, 'spatialPong', ARRAY[1, 3], '2023-06-01 22:16:00', '2023-06-01 22:20:00', 250, 1, ARRAY[5, 4]),
	(6, 'spatialPong', ARRAY[2, 3], '2023-06-01 22:20:00', '2023-06-01 22:24:00', 250, 3, ARRAY[2, 5]),
	(7, 'spatialPong', ARRAY[2, 3], '2023-06-01 22:24:00', '2023-06-01 22:28:00', 250, 1, ARRAY[1, 5]);

-- Insertion of User statistics
INSERT INTO public."GameStatistics" ("ID", "user_id", "game_id", "key", "value", "created_at", "updated_at")
VALUES
	(1, 1, 1, 'classic_pong', '1', '2023-06-01 22:00:00', '2023-06-01 22:00:00'),
	(2, 2, 1, 'classic_pong', '32', '2023-06-01 22:00:00', '2023-06-01 22:00:00'),
	(3, 3, 1, 'classic_pong', '1', '2023-06-01 22:00:00', '2023-06-01 22:00:00'),
	(4, 1, 1, 'play_time', '250','2023-06-01 22:00:00', '2023-06-01 22:00:00'),
	(5, 2, 1, 'play_time', '250','2023-06-01 22:00:00', '2023-06-01 22:00:00'),
	(6, 3, 1, 'play_time', '1000','2023-06-01 22:00:00', '2023-06-01 22:00:00'),
	(7, 4, 1, 'play_time', '2000','2023-06-01 22:00:00', '2023-06-01 22:00:00'),
	(8, 1, 1, 'score', '5', '2023-06-01 22:00:00', '2023-06-01 22:00:00'),
	(9, 2, 1, 'score', '4', '2023-06-01 22:00:00', '2023-06-01 22:00:00'),
	(10, 3, 1, 'score', '800', '2023-06-01 22:00:00', '2023-06-01 22:00:00'),
	(11, 1, 1, 'block_shots', '220', '2023-06-01 22:00:00', '2023-06-01 22:00:00'),
	(12, 1, 1, 'max_game_speed', '500', '2023-06-01 22:00:00', '2023-06-01 22:00:00'),
	(13, 1, 1, 'win', '65', '2023-06-01 22:00:00', '2023-06-01 22:00:00'),
	(14, 1, 1, 'deflect_shot', '120', '2023-06-01 22:00:00', '2023-06-01 22:00:00'),
	(15, 1, 1, 'cascade_bounce', '70', '2023-06-01 22:00:00', '2023-06-01 22:00:00'),
	(16, 4, 1, 'spatial_pong', '1', '2023-06-01 22:00:00', '2023-06-01 22:00:00'),
	(17, 5, 1, 'spatial_pong', '1', '2023-06-01 22:00:00', '2023-06-01 22:00:00'),
	(18, 6, 1, 'spatial_pong', '1', '2023-06-01 22:00:00', '2023-06-01 22:00:00'),
	(19, 7, 1, 'spatial_pong', '1', '2023-06-01 22:00:00', '2023-06-01 22:00:00'),
	(20, 8, 1, 'spatial_pong', '1', '2023-06-01 22:00:00', '2023-06-01 22:00:00'),
	(21, 9, 1, 'spatial_pong', '1', '2023-06-01 22:00:00', '2023-06-01 22:00:00'),
	(22, 10, 1, 'spatial_pong', '1', '2023-06-01 22:00:00', '2023-06-01 22:00:00'),
	(23, 11, 1, 'spatial_pong', '1', '2023-06-01 22:00:00', '2023-06-01 22:00:00'),
	(24, 2, 1, 'win', '20', '2023-06-01 22:00:00', '2023-06-01 22:00:00'),
	(25, 2, 2, 'win', '1', '2023-06-01 22:00:00', '2023-06-01 22:00:00'),
	(26, 2, 3, 'loose', '1', '2023-06-01 22:00:00', '2023-06-01 22:00:00'),
	(27, 2, 4, 'win', '1', '2023-06-01 22:00:00', '2023-06-01 22:00:00'),
	(28, 2, 5, 'loose', '1', '2023-06-01 22:00:00', '2023-06-01 22:00:00'),
	(29, 3, 4, 'win', '8', '2023-06-01 22:00:00', '2023-06-01 22:00:00'),
	(30, 3, 4, 'spatial_pong', '12', '2023-06-01 22:00:00', '2023-06-01 22:00:00'),
	(31, 3, 4, 'loose', '4', '2023-06-01 22:00:00', '2023-06-01 22:00:00'),
	(33, 4, 4, 'win', '12', '2023-06-01 22:00:00', '2023-06-01 22:00:00'),
	(34, 4, 4, 'spatial_pong', '16', '2023-06-01 22:00:00', '2023-06-01 22:00:00'),
	(35, 4, 4, 'loose', '4', '2023-06-01 22:00:00', '2023-06-01 22:00:00'),
	(36, 5, 5, 'win', '42', '2023-06-01 22:00:00', '2023-06-01 22:00:00'),
	(37, 5, 5, 'spatial_pong', '30', '2023-06-01 22:00:00', '2023-06-01 22:00:00'),
	(38, 5, 5, 'loose', '12', '2023-06-01 22:00:00', '2023-06-01 22:00:00'),
	(39, 6, 5, 'win', '22', '2023-06-01 22:00:00', '2023-06-01 22:00:00'),
	(40, 6, 5, 'spatial_pong', '18', '2023-06-01 22:00:00', '2023-06-01 22:00:00'),
	(41, 6, 5, 'loose', '4', '2023-06-01 22:00:00', '2023-06-01 22:00:00'),
	(42, 7, 5, 'win', '42', '2023-06-01 22:00:00', '2023-06-01 22:00:00'),
	(43, 7, 5, 'spatial_pong', '30', '2023-06-01 22:00:00', '2023-06-01 22:00:00'),
	(44, 7, 5, 'loose', '12', '2023-06-01 22:00:00', '2023-06-01 22:00:00'),
	(45, 8, 5, 'win', '22', '2023-06-01 22:00:00', '2023-06-01 22:00:00'),
	(46, 8, 5, 'spatial_pong', '18', '2023-06-01 22:00:00', '2023-06-01 22:00:00'),
	(47, 8, 5, 'loose', '4', '2023-06-01 22:00:00', '2023-06-01 22:00:00'),
	(48, 1, 0, 'loose', '4', '2023-06-01 22:00:00', '2023-06-01 22:00:00');

INSERT INTO public."UserRelation" ("user_id","relation_id","status","created_at","updated_at")
VALUES
	(1, 2, 'friend', '2023-06-01 22:00:00', '2023-06-01 22:00:00'),
	(1, 11, 'blocked', '2023-06-01 22:00:00', '2023-06-01 22:00:00'),
	(1, 4, 'requesting', '2023-06-01 22:00:00', '2023-06-01 22:00:00'),
	(11, 3, 'blocked', '2023-06-01 22:00:00', '2023-06-01 22:00:00'),
	(11, 4, 'friend', '2023-06-01 22:00:00', '2023-06-01 22:00:00'),
	(5, 1, 'friend', '2023-06-01 22:00:00', '2023-06-01 22:00:00'),
	(6, 11, 'blocked', '2023-06-01 22:00:00', '2023-06-01 22:00:00'),
	(7, 11, 'blocked', '2023-06-01 22:00:00', '2023-06-01 22:00:00'),
	(8, 11, 'blocked', '2023-06-01 22:00:00', '2023-06-01 22:00:00'),
	(9, 11, 'blocked', '2023-06-01 22:00:00', '2023-06-01 22:00:00'),
	(10, 11, 'blocked', '2023-06-01 22:00:00', '2023-06-01 22:00:00'),
	(11, 11, 'blocked', '2023-06-01 22:00:00', '2023-06-01 22:00:00');
	

-- Reset Postgres sequence to the max ID + 1
SELECT setval(pg_get_serial_sequence('public."Message"', 'ID'), coalesce(max("ID"), 0) + 1, false) FROM public."Message";
SELECT setval(pg_get_serial_sequence('public."User"', 'ID'), coalesce(max("ID"), 0) + 1, false) FROM public."User";
SELECT setval(pg_get_serial_sequence('public."UserChannel"', 'ID'), coalesce(max("ID"), 0) + 1, false) FROM public."UserChannel";
SELECT setval(pg_get_serial_sequence('public."UserAchievement"', 'ID'), coalesce(max("ID"), 0) + 1, false) FROM public."UserAchievement";
SELECT setval(pg_get_serial_sequence('public."GameStatistics"', 'ID'), coalesce(max("ID"), 0) + 1, false) FROM public."GameStatistics";
SELECT setval(pg_get_serial_sequence('public."Channel"', 'ID'), coalesce(max("ID"), 0) + 1, false) FROM public."Channel";
SELECT setval(pg_get_serial_sequence('public."UserMeta"', 'ID'), coalesce(max("ID"), 0) + 1, false) FROM public."UserMeta";
SELECT setval(pg_get_serial_sequence('public."UserRelation"', 'ID'), coalesce(max("ID"), 0) + 1, false) FROM public."UserRelation";
SELECT setval(pg_get_serial_sequence('public."UserChannel"', 'ID'), coalesce(max("ID"), 0) + 1, false) FROM public."UserChannel";
SELECT setval(pg_get_serial_sequence('public."Game"', 'ID'), coalesce(max("ID"), 0) + 1, false) FROM public."Game";
