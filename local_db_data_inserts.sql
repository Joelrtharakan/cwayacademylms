--
-- PostgreSQL database dump
--

\restrict Pl3U6DG0rTqycMGwpNmL2Kk0dGu8lrOAWsCg1T3wCcj0jluczm25pAZhSrwmLbw

-- Dumped from database version 16.14
-- Dumped by pg_dump version 18.4 (Homebrew)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Data for Name: Category; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public."Category" VALUES ('cmqku2zc000033u1q4jxxz6rm', 'Biblical Studies', 'biblical-studies', 'book-open', 0, NULL, '2026-06-19 11:16:41.952');
INSERT INTO public."Category" VALUES ('cmqku2zc200043u1qepizf3ax', 'Theology', 'theology', 'flame', 0, NULL, '2026-06-19 11:16:41.955');
INSERT INTO public."Category" VALUES ('cmqku2zc400053u1q598m2y8t', 'Ministry & Leadership', 'ministry-leadership', 'users', 0, NULL, '2026-06-19 11:16:41.956');
INSERT INTO public."Category" VALUES ('cmqku2zc500063u1qa0r9egdz', 'Church History', 'church-history', 'building-church', 0, NULL, '2026-06-19 11:16:41.958');
INSERT INTO public."Category" VALUES ('cmqku2zc600073u1q20sr90j1', 'Spiritual Formation', 'spiritual-formation', 'heart', 0, NULL, '2026-06-19 11:16:41.959');


--
-- Data for Name: Program; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public."Program" VALUES ('cmqdmxali00009bd9nmskius7', 'Master of Divinity (M.Div.)', 'The Master of Divinity (M.Div.) program is a comprehensive theological and ministerial training course designed to equip students with a strong foundation in Biblical studies, Christian doctrine, spiritual formation, pastoral ministry, preaching, missions, and leadership. Through structured coursework and practical ministry experience, students will be prepared to serve effectively in churches, missions, and Christian organizations while growing in their relationship with Christ and commitment to His Kingdom.', NULL, NULL, '3 Years', '[]', 'PUBLISHED', '2026-06-14 10:21:56.071', '2026-06-21 20:17:07.704');


--
-- Data for Name: User; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public."User" VALUES ('cmql8quqk0000h58xt3rfj7uo', 'Joel R Tharakan', 'joelrtharakan@gmail.com', '$2b$12$3D98EqtM5sqS7/R/7Mln4evVTRtmO6vEwon1jg4oQkbCy4Il2EXE2', 'INSTRUCTOR', 'https://pub-f282ad46200f49dc90b58a8a4e737923.r2.dev/avatars/1781892569411-cmql8quqk0000h58xt3rfj7uo.jpeg', '', '+91 6360238632', 'Crossway AG Church', 'BENGALURU', 'ENGLISH', true, false, 0, NULL, NULL, NULL, NULL, '2026-06-19 18:07:10.364', '2026-06-20 09:27:33.101', NULL, 'Mr.', 'B.Tech', 1, '[]', '{}');
INSERT INTO public."User" VALUES ('cmqku2zby00023u1qy4o9yich', 'Pr. Robin Ninan', 'pr.robin@cwayacademy.com', '$2b$12$uyuVqkBdoUtDZiZp.bCrCutMtvfAS9m9rNhM45WAQ58SXwqwCsUNW', 'INSTRUCTOR', NULL, 'Holding a Master of Divinity and extensive experience in leadership, management, and media. Secretary-Trustee of CWAY Missions Religious Trust, Bangalore.', NULL, 'CWAY Missions', 'Bangalore, India', 'ENGLISH', true, false, 0, NULL, NULL, NULL, NULL, '2026-06-19 11:16:41.95', '2026-06-20 09:27:39.205', NULL, NULL, NULL, NULL, '[]', '{}');
INSERT INTO public."User" VALUES ('cmqku2zbu00013u1qbthq3afd', 'Dr. Reeju Tharakan', 'dr.reeju@cwayacademy.com', '$2b$12$uyuVqkBdoUtDZiZp.bCrCutMtvfAS9m9rNhM45WAQ58SXwqwCsUNW', 'INSTRUCTOR', NULL, 'With a Ph.D. in Christian Studies and a Master of Theology in History of Christianity and 24 years of experience in theological education. Lead Pastor of Immanuel AG Church in Dubai and President-Trustee of CWAY Missions.', NULL, 'Immanuel AG Church, Dubai', 'Dubai, UAE', 'ENGLISH', true, false, 0, NULL, NULL, NULL, NULL, '2026-06-19 11:16:41.947', '2026-06-20 09:27:43.758', NULL, NULL, NULL, NULL, '[]', '{}');
INSERT INTO public."User" VALUES ('cmqku2zct000k3u1qegpd6yok', 'Reviewer 1', 'reviewer1@cway.dev', '$2b$12$ZrQzKEEu6XwGD4Nvuc30GuIfLYB3iZJ9Yar5feSoSdxlCucoleuOC', 'STUDENT', NULL, NULL, NULL, NULL, NULL, 'ENGLISH', true, false, 70, NULL, NULL, NULL, NULL, '2026-06-19 11:16:41.982', '2026-06-19 11:16:41.982', NULL, NULL, NULL, NULL, '[]', '{}');
INSERT INTO public."User" VALUES ('cmqku2zd0000n3u1q8wvzo2kx', 'Reviewer 2', 'reviewer2@cway.dev', '$2b$12$ZrQzKEEu6XwGD4Nvuc30GuIfLYB3iZJ9Yar5feSoSdxlCucoleuOC', 'STUDENT', NULL, NULL, NULL, NULL, NULL, 'ENGLISH', true, false, 70, NULL, NULL, NULL, NULL, '2026-06-19 11:16:41.988', '2026-06-19 11:16:41.988', NULL, NULL, NULL, NULL, '[]', '{}');
INSERT INTO public."User" VALUES ('cmqku2zd4000q3u1q3cmhdn0m', 'Reviewer 3', 'reviewer3@cway.dev', '$2b$12$ZrQzKEEu6XwGD4Nvuc30GuIfLYB3iZJ9Yar5feSoSdxlCucoleuOC', 'STUDENT', NULL, NULL, NULL, NULL, NULL, 'ENGLISH', true, false, 70, NULL, NULL, NULL, NULL, '2026-06-19 11:16:41.993', '2026-06-19 11:16:41.993', NULL, NULL, NULL, NULL, '[]', '{}');
INSERT INTO public."User" VALUES ('cmqku2zeo004t3u1qdff43hnt', 'Rahul Sharma', 'student1@test.com', '$2b$12$ZrQzKEEu6XwGD4Nvuc30GuIfLYB3iZJ9Yar5feSoSdxlCucoleuOC', 'STUDENT', NULL, NULL, NULL, 'Grace Bible Church', 'Kerala', 'ENGLISH', true, false, 70, NULL, NULL, NULL, NULL, '2026-06-19 11:16:42.049', '2026-06-19 11:16:42.049', NULL, NULL, NULL, NULL, '[]', '{}');
INSERT INTO public."User" VALUES ('cmqku2zep004u3u1q9vsn4vwi', 'Priya Nair', 'student2@test.com', '$2b$12$ZrQzKEEu6XwGD4Nvuc30GuIfLYB3iZJ9Yar5feSoSdxlCucoleuOC', 'STUDENT', NULL, NULL, NULL, 'Bethel Fellowship', 'Tamil Nadu', 'TAMIL', true, false, 70, NULL, NULL, NULL, NULL, '2026-06-19 11:16:42.05', '2026-06-19 11:16:42.05', NULL, NULL, NULL, NULL, '[]', '{}');
INSERT INTO public."User" VALUES ('cmqku2zeq004v3u1qxmenxe88', 'Samuel David', 'student3@test.com', '$2b$12$ZrQzKEEu6XwGD4Nvuc30GuIfLYB3iZJ9Yar5feSoSdxlCucoleuOC', 'STUDENT', NULL, NULL, NULL, 'Emmanuel Assembly', 'Karnataka', 'TELUGU', true, false, 70, NULL, NULL, NULL, NULL, '2026-06-19 11:16:42.05', '2026-06-19 11:16:42.05', NULL, NULL, NULL, NULL, '[]', '{}');
INSERT INTO public."User" VALUES ('cmqku2zeq004w3u1qss13hsfr', 'Mary Thomas', 'student4@test.com', '$2b$12$ZrQzKEEu6XwGD4Nvuc30GuIfLYB3iZJ9Yar5feSoSdxlCucoleuOC', 'STUDENT', NULL, NULL, NULL, 'Zion Chapel', 'Andhra Pradesh', 'MALAYALAM', true, false, 70, NULL, NULL, NULL, NULL, '2026-06-19 11:16:42.051', '2026-06-19 11:16:42.051', NULL, NULL, NULL, NULL, '[]', '{}');
INSERT INTO public."User" VALUES ('cmqku2zer004x3u1q5zxvdqbs', 'Amit Patel', 'student5@test.com', '$2b$12$ZrQzKEEu6XwGD4Nvuc30GuIfLYB3iZJ9Yar5feSoSdxlCucoleuOC', 'STUDENT', NULL, NULL, NULL, 'Calvary Tabernacle', 'Maharashtra', 'KANNADA', true, false, 70, NULL, NULL, NULL, NULL, '2026-06-19 11:16:42.052', '2026-06-19 11:16:42.052', NULL, NULL, NULL, NULL, '[]', '{}');
INSERT INTO public."User" VALUES ('cmqku2zes004y3u1qxcgenhbm', 'Shalini Kumari', 'student6@test.com', '$2b$12$ZrQzKEEu6XwGD4Nvuc30GuIfLYB3iZJ9Yar5feSoSdxlCucoleuOC', 'STUDENT', NULL, NULL, NULL, 'Hebron Assembly', 'Jharkhand', 'HINDI', true, false, 70, NULL, NULL, NULL, NULL, '2026-06-19 11:16:42.052', '2026-06-19 11:16:42.052', NULL, NULL, NULL, NULL, '[]', '{}');
INSERT INTO public."User" VALUES ('cmqku2zet004z3u1qsf61dlmm', 'Ebenezer Paul', 'student7@test.com', '$2b$12$ZrQzKEEu6XwGD4Nvuc30GuIfLYB3iZJ9Yar5feSoSdxlCucoleuOC', 'STUDENT', NULL, NULL, NULL, 'Trinity Covenant', 'Assam', 'ENGLISH', true, false, 70, NULL, NULL, NULL, NULL, '2026-06-19 11:16:42.053', '2026-06-19 11:16:42.053', NULL, NULL, NULL, NULL, '[]', '{}');
INSERT INTO public."User" VALUES ('cmqku2zet00503u1q3tos24vz', 'Rupali Das', 'student8@test.com', '$2b$12$ZrQzKEEu6XwGD4Nvuc30GuIfLYB3iZJ9Yar5feSoSdxlCucoleuOC', 'STUDENT', NULL, NULL, NULL, 'Redeemer Assembly', 'West Bengal', 'ENGLISH', true, false, 70, NULL, NULL, NULL, NULL, '2026-06-19 11:16:42.054', '2026-06-19 11:16:42.054', NULL, NULL, NULL, NULL, '[]', '{}');
INSERT INTO public."User" VALUES ('cmqku2zeu00513u1q4ljp2a52', 'John Wesley', 'student9@test.com', '$2b$12$ZrQzKEEu6XwGD4Nvuc30GuIfLYB3iZJ9Yar5feSoSdxlCucoleuOC', 'STUDENT', NULL, NULL, NULL, 'Faith Mission', 'Uttar Pradesh', 'ENGLISH', true, false, 70, NULL, NULL, NULL, NULL, '2026-06-19 11:16:42.054', '2026-06-19 11:16:42.054', NULL, NULL, NULL, NULL, '[]', '{}');
INSERT INTO public."User" VALUES ('cmqku2zeu00523u1qd33zl1p7', 'Mercy Mathew', 'student10@test.com', '$2b$12$ZrQzKEEu6XwGD4Nvuc30GuIfLYB3iZJ9Yar5feSoSdxlCucoleuOC', 'STUDENT', NULL, NULL, NULL, 'Hope Fellowship', 'Telangana', 'ENGLISH', true, false, 70, NULL, NULL, NULL, NULL, '2026-06-19 11:16:42.055', '2026-06-19 11:16:42.055', NULL, NULL, NULL, NULL, '[]', '{}');
INSERT INTO public."User" VALUES ('cmqku2zbo00003u1qrtqtk0h8', 'CWAY Admin', 'admin@cwayacademy.com', '$2b$12$bp47KfmHG258KcNitM5YGOdwz3Y/eIcyfvFq6oKMOtKvaSR6MmXZC', 'ADMIN', 'https://pub-f282ad46200f49dc90b58a8a4e737923.r2.dev/avatars/1781889985771-cmqku2zbo00003u1qrtqtk0h8.jpeg', NULL, NULL, NULL, NULL, 'ENGLISH', true, false, 70, NULL, NULL, NULL, NULL, '2026-06-19 11:16:41.941', '2026-06-19 17:26:27.896', NULL, NULL, NULL, NULL, '[]', '{}');


--
-- Data for Name: Course; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public."Course" VALUES ('cmqm4xmwo0005fzym9rhv5byg', 'Church History and Historical Theology', 'church-history-and-historical-theology', '', 'This course surveys the history of Christianity from the apostolic era to the modern church. Students will explore major movements, theological developments, councils, reformations, and influential Christian leaders that have shaped the church throughout history.', 'https://pub-f282ad46200f49dc90b58a8a4e737923.r2.dev/thumbnails/1781954512817-cmqm4xmwo0005fzym9rhv5byg-1781954512817.png', NULL, 0, 'INR', 'PUBLISHED', 'BEGINNER', 'ENGLISH', NULL, 6, 0, 0, NULL, false, true, '[]', '[]', '[]', '', '', '[]', NULL, 'cmqku2zbu00013u1qbthq3afd', 'cmqku2zc500063u1qa0r9egdz', '2026-06-20 09:08:14.52', '2026-06-21 13:21:31.994', 'ACCEPTED', 'cmqdmxali00009bd9nmskius7', 'MDIV 502');
INSERT INTO public."Course" VALUES ('cmqm3bas20005pm88e08zdgem', 'Pastoral Theology and Christian Leadership', 'pastoral-theology-and-christian-leadership-1', '', 'This course examines the biblical foundations and practical aspects of pastoral ministry and leadership. Emphasis is placed on shepherding, discipleship, counseling, administration, and servant leadership in the church.', 'https://pub-f282ad46200f49dc90b58a8a4e737923.r2.dev/thumbnails/1781955105749-cmqm3bas20005pm88e08zdgem-1781955105749.png', NULL, 0, 'INR', 'PUBLISHED', 'BEGINNER', 'ENGLISH', NULL, 6, 0, 0, NULL, false, true, '[]', '[]', '[]', '', '', '[]', NULL, 'cmql8quqk0000h58xt3rfj7uo', 'cmqku2zc200043u1qepizf3ax', '2026-06-20 08:22:52.754', '2026-06-21 13:21:40.402', 'ACCEPTED', 'cmqdmxali00009bd9nmskius7', 'MDIV 501');


--
-- Data for Name: Section; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public."Section" VALUES ('cmqm7o0px0001676p3m8poipq', 'cmqm4xmwo0005fzym9rhv5byg', 'Week 1: The Early Church and the Medieval Period', 'This course provides a survey of the historical development of Christianity and the major theological traditions that have shaped the Church from the apostolic era to the present day. Students will examine significant events, influential leaders, ecumenical councils, the Protestant Reformation, missionary movements, and contemporary theological developments. Through the study of church history and historical theology, students will gain a deeper understanding of the continuity of the Christian faith and its relevance for ministry in the modern world.', '[]', NULL, false, 0);
INSERT INTO public."Section" VALUES ('cmqm84hxm000i676p1tz73xr2', 'cmqm4xmwo0005fzym9rhv5byg', 'Week 2: The Reformation and Modern Christianity', 'This module examines the Protestant Reformation and its theological significance, the rise of missionary movements, and the growth of Christianity throughout the modern era. Students will also consider contemporary challenges and opportunities facing the Church in the twenty-first century.', '[]', NULL, false, 1);
INSERT INTO public."Section" VALUES ('cmqma3dhl0010fjta6rse61y7', 'cmqm3bas20005pm88e08zdgem', 'Week 1: Foundations of Pastoral Ministry', 'This module introduces students to the biblical understanding of pastoral ministry and Christian leadership. Students will examine the qualifications and responsibilities of pastors, the model of servant leadership demonstrated by Jesus Christ, and the importance of shepherding God''s people with love and faithfulness.', '[]', NULL, false, 0);
INSERT INTO public."Section" VALUES ('cmqma4r8j0012fjtawds1ajg0', 'cmqm3bas20005pm88e08zdgem', 'Week 2: Christian Leadership and Ministry Practice', 'This module focuses on the practical aspects of Christian leadership, including spiritual formation, discipleship, church administration, pastoral counseling, and ministry development. Students will explore ways to effectively lead congregations while maintaining personal spiritual growth and integrity.', '[]', NULL, false, 1);


--
-- Data for Name: Announcement; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: Lesson; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public."Lesson" VALUES ('cmqm7qfur0003676pzxgtogtb', 'cmqm7o0px0001676p3m8poipq', 'The First 150 Years of Christianity in the Roman World', 'VIDEO', NULL, 'https://youtu.be/oM8Gcn1gbRw?si=XNRIeYTwonTZcFYe', 780, 0, false, false, NULL, NULL, NULL);
INSERT INTO public."Lesson" VALUES ('cmqm7xxk40005676pf5itb3zf', 'cmqm7o0px0001676p3m8poipq', 'Early Christian Schisms - Before Imperium - Extra History', 'VIDEO', NULL, 'https://youtu.be/E1ZZeCDGHJE?si=qGqhNLOde2OZQeno', 480, 1, false, false, NULL, NULL, NULL);
INSERT INTO public."Lesson" VALUES ('cmqm830ov000g676pi9q80t1h', 'cmqm7o0px0001676p3m8poipq', 'What lessons can contemporary believers learn from the faith and commitment of the early church?', 'FORUM', 'Give a Reply for this Question', NULL, 0, 3, false, false, NULL, 25, NULL);
INSERT INTO public."Lesson" VALUES ('cmqm88xop000p676peegc2hlt', 'cmqm84hxm000i676p1tz73xr2', 'Church History Timeline Project (1,000–1,500 words)', 'ASSIGNMENT', NULL, NULL, 0, 1, false, false, NULL, NULL, NULL);
INSERT INTO public."Lesson" VALUES ('cmqmas8i9002efjtat36qtmqu', 'cmqma4r8j0012fjtawds1ajg0', 'Leadership, 5 Things Jesus Teaches us about Leadership', 'VIDEO', NULL, 'https://youtu.be/1ru9B3E1joY?si=O8jS_y-w9N85v09B', 660, 0, false, false, NULL, NULL, NULL);
INSERT INTO public."Lesson" VALUES ('cmqmaunv0002jfjtabouyu5z4', 'cmqma4r8j0012fjtawds1ajg0', 'Ministry Development Project (1,000–1,500 words)', 'ASSIGNMENT', NULL, NULL, 0, 1, false, false, NULL, NULL, NULL);
INSERT INTO public."Lesson" VALUES ('cmqmb15gu003mfjtagdy38md2', 'cmqma4r8j0012fjtawds1ajg0', 'Forum 2', 'FORUM', 'What challenges do Christian leaders face today, and how can they remain faithful to their calling?', NULL, 0, 3, false, false, NULL, 25, NULL);
INSERT INTO public."Lesson" VALUES ('cmqm80ohb000c676pmvmgotrk', 'cmqm7o0px0001676p3m8poipq', 'Historical Reflection Essay (700–1,000 words)', 'ASSIGNMENT', NULL, NULL, 0, 2, false, false, NULL, NULL, NULL);
INSERT INTO public."Lesson" VALUES ('cmqm861xv000k676palb9pam4', 'cmqm84hxm000i676p1tz73xr2', ' Why did the Protestant Reformation Happen?', 'VIDEO', NULL, 'https://youtu.be/cXYyIBdBubE?si=k3bckFT9v9I71lt0', 720, 0, false, false, NULL, NULL, NULL);
INSERT INTO public."Lesson" VALUES ('cmqm8b1ct000t676pealzxzcv', 'cmqm84hxm000i676p1tz73xr2', 'In what ways has the Protestant Reformation shaped the beliefs and practices of the modern Church?', 'FORUM', 'Give as reply for the Forum', NULL, 0, 2, false, false, NULL, 25, NULL);
INSERT INTO public."Lesson" VALUES ('cmqm8cx3c000w676p4tm0ux3m', 'cmqm84hxm000i676p1tz73xr2', 'Week 2 Quiz', 'QUIZ', '', NULL, 0, 3, false, false, NULL, NULL, NULL);
INSERT INTO public."Lesson" VALUES ('cmqm9bhoc0002fjtamemwjsgb', 'cmqm7o0px0001676p3m8poipq', 'Week 1 Quiz', 'QUIZ', '', NULL, 0, 4, false, false, NULL, NULL, NULL);
INSERT INTO public."Lesson" VALUES ('cmqma7u560014fjta1di1my64', 'cmqma3dhl0010fjta6rse61y7', 'What is Pastoral Ministry?', 'VIDEO', NULL, 'https://youtu.be/hyJKt2hbod8?si=L2H06iZ1wqsw-TJ7', 180, 0, false, false, NULL, NULL, NULL);
INSERT INTO public."Lesson" VALUES ('cmqmag2e2001dfjtatsq6s9pj', 'cmqma3dhl0010fjta6rse61y7', 'Disscusion Week 1', 'FORUM', 'Why is servant leadership essential for effective pastoral ministry in the twenty-first century?', NULL, 0, 2, false, false, NULL, 25, NULL);
INSERT INTO public."Lesson" VALUES ('cmqmagxos001gfjtatxn5zxo5', 'cmqma3dhl0010fjta6rse61y7', 'Week 1 Quiz', 'QUIZ', '', NULL, 0, 3, false, false, NULL, NULL, NULL);
INSERT INTO public."Lesson" VALUES ('cmqmab2yd0019fjtan1gr22cr', 'cmqma3dhl0010fjta6rse61y7', 'Reflection Paper (700–1,000 words)', 'ASSIGNMENT', NULL, NULL, 0, 1, false, false, NULL, NULL, NULL);
INSERT INTO public."Lesson" VALUES ('cmqmav4yw002ofjta6c5ocmpl', 'cmqma4r8j0012fjtawds1ajg0', 'Week 2 Quiz', 'QUIZ', '', NULL, 0, 2, false, false, NULL, NULL, NULL);


--
-- Data for Name: Rubric; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: Quiz; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public."Quiz" VALUES ('cmqm8cx3g000y676prkm8offi', 'cmqm8cx3c000w676p4tm0ux3m', 'Week 2 Quiz', 70, 120, 2, NULL);
INSERT INTO public."Quiz" VALUES ('cmqm9bhof0004fjta9a419oal', 'cmqm9bhoc0002fjtamemwjsgb', 'Week 1 Quiz', 70, 300, 1, NULL);
INSERT INTO public."Quiz" VALUES ('cmqmagxoz001ifjtap3v7ekhu', 'cmqmagxos001gfjtatxn5zxo5', 'Week 1 Quiz', 70, 180, 2, NULL);
INSERT INTO public."Quiz" VALUES ('cmqmav4z2002qfjta8sk12q8p', 'cmqmav4yw002ofjta6c5ocmpl', 'Week 2 Quiz', 70, 240, 2, NULL);


--
-- Data for Name: Question; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public."Question" VALUES ('cmqm8r0py0010676pjacvj8tx', 'cmqm8cx3g000y676prkm8offi', '1. Who initiated the Protestant Reformation in 1517?', 'MCQ', 1, 0, NULL);
INSERT INTO public."Question" VALUES ('cmqm8syoz0016676pf1wpfvuc', 'cmqm8cx3g000y676prkm8offi', '2. What document did Martin Luther publish in 1517?', 'MCQ', 1, 1, NULL);
INSERT INTO public."Question" VALUES ('cmqm8u3py001c676px5058mj9', 'cmqm8cx3g000y676prkm8offi', '3. Which doctrine emphasizes salvation by faith alone?', 'MCQ', 1, 2, NULL);
INSERT INTO public."Question" VALUES ('cmqm8vcaf001i676pc0ms9r2b', 'cmqm8cx3g000y676prkm8offi', '4. Who wrote Institutes of the Christian Religion?', 'MCQ', 1, 3, NULL);
INSERT INTO public."Question" VALUES ('cmqm8web8001o676p3s2ey700', 'cmqm8cx3g000y676prkm8offi', '5. Which movement emphasized global evangelization during the eighteenth and nineteenth centuries?', 'MCQ', 1, 4, NULL);
INSERT INTO public."Question" VALUES ('cmqm9d2kp0006fjtav409qnoe', 'cmqm9bhof0004fjta9a419oal', '1. Which event marked the birth of the Christian Church?', 'MCQ', 1, 0, NULL);
INSERT INTO public."Question" VALUES ('cmqm9ecor000cfjta9zx2tdhr', 'cmqm9bhof0004fjta9a419oal', '2. Who was the first Christian martyr?', 'MCQ', 1, 1, NULL);
INSERT INTO public."Question" VALUES ('cmqm9fc12000ifjtaacd7joj3', 'cmqm9bhof0004fjta9a419oal', '3. Which Roman emperor legalized Christianity through the Edict of Milan in AD 313?', 'MCQ', 1, 2, NULL);
INSERT INTO public."Question" VALUES ('cmqm9gdit000ofjtaypczypg1', 'cmqm9bhof0004fjta9a419oal', '4. Which church council affirmed the deity of Christ in AD 325?', 'MCQ', 1, 3, NULL);
INSERT INTO public."Question" VALUES ('cmqm9hkp9000ufjtav6vc7j7n', 'cmqm9bhof0004fjta9a419oal', '5. Who is known as the "Father of Western Monasticism"?', 'MCQ', 1, 4, NULL);
INSERT INTO public."Question" VALUES ('cmqmaiod1001kfjtalfgwev8o', 'cmqmagxoz001ifjtap3v7ekhu', '1. Which passage outlines the qualifications for overseers?', 'MCQ', 1, 0, NULL);
INSERT INTO public."Question" VALUES ('cmqmak1ay001qfjta272cjzdk', 'cmqmagxoz001ifjtap3v7ekhu', '2. Jesus described Himself as the:', 'MCQ', 1, 1, NULL);
INSERT INTO public."Question" VALUES ('cmqmalcwk001wfjta3g37o2lr', 'cmqmagxoz001ifjtap3v7ekhu', '3. According to 1 Peter 5:1–4, elders are to shepherd God''s flock:', 'MCQ', 1, 2, NULL);
INSERT INTO public."Question" VALUES ('cmqmamfes0022fjtau37xuuwt', 'cmqmagxoz001ifjtap3v7ekhu', '4. Servant leadership is best demonstrated by:', 'MCQ', 1, 3, NULL);
INSERT INTO public."Question" VALUES ('cmqmanq9v0028fjtax35vzqnc', 'cmqmagxoz001ifjtap3v7ekhu', '5. Which quality is required of church leaders according to Titus 1?', 'MCQ', 1, 4, NULL);
INSERT INTO public."Question" VALUES ('cmqmawb38002sfjtabz083w4a', 'cmqmav4z2002qfjta8sk12q8p', '1. Which passage contains the Great Commission?', 'MCQ', 1, 0, NULL);
INSERT INTO public."Question" VALUES ('cmqmaxje6002yfjtaszngtc1z', 'cmqmav4z2002qfjta8sk12q8p', '2. According to Ephesians 4:11–12, church leaders are given to:

', 'MCQ', 1, 1, NULL);
INSERT INTO public."Question" VALUES ('cmqmaygcy0034fjtazgrmd7ic', 'cmqmav4z2002qfjta8sk12q8p', '3. Paul instructed the Ephesian elders to:', 'MCQ', 1, 2, NULL);
INSERT INTO public."Question" VALUES ('cmqmazbow003afjtat094ha02', 'cmqmav4z2002qfjta8sk12q8p', '4. Which attitude is emphasized in Philippians 2?
', 'MCQ', 1, 3, NULL);
INSERT INTO public."Question" VALUES ('cmqmb06zf003gfjta053o2z64', 'cmqmav4z2002qfjta8sk12q8p', '5. Christian leadership should primarily reflect:', 'MCQ', 1, 4, NULL);


--
-- Data for Name: Answer; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public."Answer" VALUES ('cmqm8r0py0011676pc56gkxbb', 'cmqm8r0py0010676pjacvj8tx', 'John Calvin', false);
INSERT INTO public."Answer" VALUES ('cmqm8r0py0012676pkwc3u3vf', 'cmqm8r0py0010676pjacvj8tx', 'Martin Luther', true);
INSERT INTO public."Answer" VALUES ('cmqm8r0py0013676pcjy5nkhy', 'cmqm8r0py0010676pjacvj8tx', 'John Wesley', false);
INSERT INTO public."Answer" VALUES ('cmqm8r0py0014676plm5yi7jl', 'cmqm8r0py0010676pjacvj8tx', 'Ulrich Zwingli', false);
INSERT INTO public."Answer" VALUES ('cmqm8syoz0017676p48aylem7', 'cmqm8syoz0016676pf1wpfvuc', 'Augsburg Confession', false);
INSERT INTO public."Answer" VALUES ('cmqm8syoz0018676pj609b7bj', 'cmqm8syoz0016676pf1wpfvuc', 'Institutes of the Christian Religion', false);
INSERT INTO public."Answer" VALUES ('cmqm8syoz0019676pmbsinawt', 'cmqm8syoz0016676pf1wpfvuc', 'Ninety-Five Theses', true);
INSERT INTO public."Answer" VALUES ('cmqm8syoz001a676pkgy5t18o', 'cmqm8syoz0016676pf1wpfvuc', 'Westminster Confession', false);
INSERT INTO public."Answer" VALUES ('cmqm8u3py001d676p5yfpzgr0', 'cmqm8u3py001c676px5058mj9', 'Sola Scriptura', false);
INSERT INTO public."Answer" VALUES ('cmqm8u3py001e676pwjhotzya', 'cmqm8u3py001c676px5058mj9', 'Sola Gratia', false);
INSERT INTO public."Answer" VALUES ('cmqm8u3py001f676pq4he9i3u', 'cmqm8u3py001c676px5058mj9', 'Solus Christus', false);
INSERT INTO public."Answer" VALUES ('cmqm8u3py001g676px6r784v0', 'cmqm8u3py001c676px5058mj9', 'Sola Fide', true);
INSERT INTO public."Answer" VALUES ('cmqm8vcaf001j676p1wa3hjpr', 'cmqm8vcaf001i676pc0ms9r2b', 'John Calvin', true);
INSERT INTO public."Answer" VALUES ('cmqm8vcaf001k676p5r5rrk81', 'cmqm8vcaf001i676pc0ms9r2b', 'Martin Luther', false);
INSERT INTO public."Answer" VALUES ('cmqm8vcaf001l676pj2y970xg', 'cmqm8vcaf001i676pc0ms9r2b', 'John Knox', false);
INSERT INTO public."Answer" VALUES ('cmqm8vcaf001m676pb6cjpe93', 'cmqm8vcaf001i676pc0ms9r2b', 'John Wesley', false);
INSERT INTO public."Answer" VALUES ('cmqm8web8001p676pm1rx5za2', 'cmqm8web8001o676p3s2ey700', 'Renaissance', false);
INSERT INTO public."Answer" VALUES ('cmqm8web8001q676ptgxtldte', 'cmqm8web8001o676p3s2ey700', 'Crusades', false);
INSERT INTO public."Answer" VALUES ('cmqm8web8001r676p45ikvc8e', 'cmqm8web8001o676p3s2ey700', 'Missionary Movement', true);
INSERT INTO public."Answer" VALUES ('cmqm8web8001s676py59arn52', 'cmqm8web8001o676p3s2ey700', 'Monastic Movement', false);
INSERT INTO public."Answer" VALUES ('cmqm9d2kp0007fjta5ue25cwk', 'cmqm9d2kp0006fjtav409qnoe', 'The Crucifixion', false);
INSERT INTO public."Answer" VALUES ('cmqm9d2kp0008fjtailrqyejo', 'cmqm9d2kp0006fjtav409qnoe', 'The Resurrection', false);
INSERT INTO public."Answer" VALUES ('cmqm9d2kp0009fjtacsanjg9e', 'cmqm9d2kp0006fjtav409qnoe', 'Pentecost', true);
INSERT INTO public."Answer" VALUES ('cmqm9d2kp000afjtaod6zo1ib', 'cmqm9d2kp0006fjtav409qnoe', 'The Council of Nicaea', false);
INSERT INTO public."Answer" VALUES ('cmqm9ecor000dfjtacrxahr8a', 'cmqm9ecor000cfjta9zx2tdhr', 'Paul', false);
INSERT INTO public."Answer" VALUES ('cmqm9ecor000efjtagien1qsr', 'cmqm9ecor000cfjta9zx2tdhr', 'Peter', false);
INSERT INTO public."Answer" VALUES ('cmqm9ecor000ffjtabco571bb', 'cmqm9ecor000cfjta9zx2tdhr', 'Stephen', true);
INSERT INTO public."Answer" VALUES ('cmqm9ecor000gfjtaduxd7p0i', 'cmqm9ecor000cfjta9zx2tdhr', 'James', false);
INSERT INTO public."Answer" VALUES ('cmqm9fc12000jfjta41sakp1g', 'cmqm9fc12000ifjtaacd7joj3', 'Nero', false);
INSERT INTO public."Answer" VALUES ('cmqm9fc12000kfjtadjb21iyg', 'cmqm9fc12000ifjtaacd7joj3', 'Constantine', true);
INSERT INTO public."Answer" VALUES ('cmqm9fc12000lfjtabpoj7e51', 'cmqm9fc12000ifjtaacd7joj3', 'Diocletian', false);
INSERT INTO public."Answer" VALUES ('cmqm9fc12000mfjta39gln583', 'cmqm9fc12000ifjtaacd7joj3', 'Augustus', false);
INSERT INTO public."Answer" VALUES ('cmqm9gdit000pfjtaqwezvuto', 'cmqm9gdit000ofjtaypczypg1', 'Council of Trent', false);
INSERT INTO public."Answer" VALUES ('cmqm9gdit000qfjta9edrh5hw', 'cmqm9gdit000ofjtaypczypg1', 'Council of Chalcedon', false);
INSERT INTO public."Answer" VALUES ('cmqm9gdit000rfjta06950c26', 'cmqm9gdit000ofjtaypczypg1', 'Council of Nicaea', true);
INSERT INTO public."Answer" VALUES ('cmqm9gdit000sfjtaalhocpgc', 'cmqm9gdit000ofjtaypczypg1', 'Council of Jerusalem', false);
INSERT INTO public."Answer" VALUES ('cmqm9hkp9000vfjta9o9glrmy', 'cmqm9hkp9000ufjtav6vc7j7n', 'Augustine', false);
INSERT INTO public."Answer" VALUES ('cmqm9hkp9000wfjtauz1jnjuo', 'cmqm9hkp9000ufjtav6vc7j7n', 'Jerome', false);
INSERT INTO public."Answer" VALUES ('cmqm9hkp9000xfjta6rl2vmx3', 'cmqm9hkp9000ufjtav6vc7j7n', 'Benedict of Nursia', true);
INSERT INTO public."Answer" VALUES ('cmqm9hkp9000yfjtax5pzfrls', 'cmqm9hkp9000ufjtav6vc7j7n', 'Athanasius', false);
INSERT INTO public."Answer" VALUES ('cmqmaiod1001lfjtaqft6rizz', 'cmqmaiod1001kfjtalfgwev8o', 'Romans 12:1–2', false);
INSERT INTO public."Answer" VALUES ('cmqmaiod1001mfjtawisrmacg', 'cmqmaiod1001kfjtalfgwev8o', '1 Timothy 3:1–7', true);
INSERT INTO public."Answer" VALUES ('cmqmaiod1001nfjtaxk6sq9l2', 'cmqmaiod1001kfjtalfgwev8o', 'Psalm 23', false);
INSERT INTO public."Answer" VALUES ('cmqmaiod1001ofjta5nbc33fx', 'cmqmaiod1001kfjtalfgwev8o', 'Revelation 21', false);
INSERT INTO public."Answer" VALUES ('cmqmak1ay001rfjtacg9z7teh', 'cmqmak1ay001qfjta272cjzdk', 'Vine', false);
INSERT INTO public."Answer" VALUES ('cmqmak1ay001sfjtan3e1ieps', 'cmqmak1ay001qfjta272cjzdk', 'Bread of Life', false);
INSERT INTO public."Answer" VALUES ('cmqmak1ay001tfjta8me5z9gc', 'cmqmak1ay001qfjta272cjzdk', 'Good Shepherd', true);
INSERT INTO public."Answer" VALUES ('cmqmak1ay001ufjtau1qklk7n', 'cmqmak1ay001qfjta272cjzdk', 'Living Water', false);
INSERT INTO public."Answer" VALUES ('cmqmalcwk001xfjtawnuidr50', 'cmqmalcwk001wfjta3g37o2lr', 'Under compulsion', false);
INSERT INTO public."Answer" VALUES ('cmqmalcwk001yfjtat4lohwt6', 'cmqmalcwk001wfjta3g37o2lr', 'Willingly and eagerly', true);
INSERT INTO public."Answer" VALUES ('cmqmalcwk001zfjtag6jwdnzl', 'cmqmalcwk001wfjta3g37o2lr', 'For financial gain', false);
INSERT INTO public."Answer" VALUES ('cmqmalcwk0020fjtaux8avkch', 'cmqmalcwk001wfjta3g37o2lr', 'By force', false);
INSERT INTO public."Answer" VALUES ('cmqmamfes0023fjta22ehq784', 'cmqmamfes0022fjtau37xuuwt', 'King Saul', false);
INSERT INTO public."Answer" VALUES ('cmqmamfes0024fjta1ji49a9p', 'cmqmamfes0022fjtau37xuuwt', 'Jesus Christ', true);
INSERT INTO public."Answer" VALUES ('cmqmamfes0025fjtaszn8fooo', 'cmqmamfes0022fjtau37xuuwt', 'Pilate', false);
INSERT INTO public."Answer" VALUES ('cmqmamfes0026fjtano8vdbcb', 'cmqmamfes0022fjtau37xuuwt', 'Herod', false);
INSERT INTO public."Answer" VALUES ('cmqmanq9v0029fjta9fgdnqk6', 'cmqmanq9v0028fjtax35vzqnc', 'Wealthy', false);
INSERT INTO public."Answer" VALUES ('cmqmanq9v002afjta5wdst5bs', 'cmqmanq9v0028fjtax35vzqnc', 'Blameless', true);
INSERT INTO public."Answer" VALUES ('cmqmanq9v002bfjta9ki7zy02', 'cmqmanq9v0028fjtax35vzqnc', 'Famous', false);
INSERT INTO public."Answer" VALUES ('cmqmanq9v002cfjtaxcjkpest', 'cmqmanq9v0028fjtax35vzqnc', 'Powerful', false);
INSERT INTO public."Answer" VALUES ('cmqmawb38002tfjta6p35j5rk', 'cmqmawb38002sfjtabz083w4a', 'Matthew 28:18–20', true);
INSERT INTO public."Answer" VALUES ('cmqmawb38002ufjtabnv9a2c2', 'cmqmawb38002sfjtabz083w4a', 'Psalm 23', false);
INSERT INTO public."Answer" VALUES ('cmqmawb38002vfjtauf6rxyz0', 'cmqmawb38002sfjtabz083w4a', 'Genesis 1', false);
INSERT INTO public."Answer" VALUES ('cmqmawb38002wfjtabcj1c4hj', 'cmqmawb38002sfjtabz083w4a', 'Revelation 22', false);
INSERT INTO public."Answer" VALUES ('cmqmaxje6002zfjtamik3aqqy', 'cmqmaxje6002yfjtaszngtc1z', 'Build kingdoms', false);
INSERT INTO public."Answer" VALUES ('cmqmaxje60030fjtajrxbnrs6', 'cmqmaxje6002yfjtaszngtc1z', 'Equip the saints for ministry', true);
INSERT INTO public."Answer" VALUES ('cmqmaxje60031fjtaepd4sfs9', 'cmqmaxje6002yfjtaszngtc1z', 'Rule nations', false);
INSERT INTO public."Answer" VALUES ('cmqmaxje60032fjtaxx23kvxn', 'cmqmaxje6002yfjtaszngtc1z', 'Gain wealth', false);
INSERT INTO public."Answer" VALUES ('cmqmaygcy0035fjta79typsck', 'cmqmaygcy0034fjtazgrmd7ic', 'Ignore false teachers', false);
INSERT INTO public."Answer" VALUES ('cmqmaygcy0036fjtatp2iw56k', 'cmqmaygcy0034fjtazgrmd7ic', 'Shepherd the church of God', true);
INSERT INTO public."Answer" VALUES ('cmqmaygcy0037fjtatnshvvsx', 'cmqmaygcy0034fjtazgrmd7ic', 'Build temples', false);
INSERT INTO public."Answer" VALUES ('cmqmaygcy0038fjta4mywnxtf', 'cmqmaygcy0034fjtazgrmd7ic', 'Seek political power', false);
INSERT INTO public."Answer" VALUES ('cmqmazbow003bfjtafjcpaoax', 'cmqmazbow003afjtat094ha02', 'Pride', false);
INSERT INTO public."Answer" VALUES ('cmqmazbow003cfjtatg7qnni2', 'cmqmazbow003afjtat094ha02', 'Humility', true);
INSERT INTO public."Answer" VALUES ('cmqmazbow003dfjtar87l8g4g', 'cmqmazbow003afjtat094ha02', 'Ambition', false);
INSERT INTO public."Answer" VALUES ('cmqmazbow003efjta5joz8nck', 'cmqmazbow003afjtat094ha02', 'Competition', false);
INSERT INTO public."Answer" VALUES ('cmqmb06zf003hfjtacxr0wg0w', 'cmqmb06zf003gfjta053o2z64', 'Authority', false);
INSERT INTO public."Answer" VALUES ('cmqmb06zf003ifjtawascpa0n', 'cmqmb06zf003gfjta053o2z64', 'Wealth', false);
INSERT INTO public."Answer" VALUES ('cmqmb06zf003jfjtaegr69qk5', 'cmqmb06zf003gfjta053o2z64', 'Service', true);
INSERT INTO public."Answer" VALUES ('cmqmb06zf003kfjtaq1o1xkvl', 'cmqmb06zf003gfjta053o2z64', 'Popularity', false);


--
-- Data for Name: Assignment; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public."Assignment" VALUES ('cmqm80ohd000e676p6czu0aux', 'cmqm80ohb000c676pmvmgotrk', 'Historical Reflection Essay (700–1,000 words)', '"How did the witness and perseverance of the early Christians contribute to the growth and preservation of the Church?"', '2026-06-21 03:00:00', 100, NULL, NULL);
INSERT INTO public."Assignment" VALUES ('cmqm88xou000r676pqmmgppo8', 'cmqm88xop000p676peegc2hlt', 'Church History Timeline Project (1,000–1,500 words)', 'Create a timeline highlighting significant events in church history and write a reflection explaining how these events continue to influence Christianity and ministry today.', '2026-06-21 09:00:00', 25, NULL, NULL);
INSERT INTO public."Assignment" VALUES ('cmqmab2yh001bfjtathv2kork', 'cmqmab2yd0019fjtan1gr22cr', 'Reflection Paper (700–1,000 words)', '"Describe the biblical qualifications and responsibilities of a pastor and explain how Jesus Christ serves as the perfect model of servant leadership."', '2026-06-21 12:00:00', 25, NULL, NULL);
INSERT INTO public."Assignment" VALUES ('cmqmaunv7002lfjtayb3y966e', 'cmqmaunv0002jfjtabouyu5z4', 'Ministry Development Project (1,000–1,500 words)', 'Prepare a ministry plan for a local church including:

Vision Statement
Mission Statement
Leadership Structure
Discipleship Strategy
Pastoral Care Plan
Evangelism and Outreach Goals', '2026-06-21 16:30:00', 25, NULL, NULL);


--
-- Data for Name: AttendanceSession; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: AttendanceRecord; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: BlogPost; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public."BlogPost" VALUES ('cmqku2zfu007l3u1qoqezuhts', 'Obedience to the Will of God — The Garrs', 'obedience-will-of-god-the-garrs', 'Alfred and Lillian Garr were model missionaries who obeyed God''s will to bring the Pentecostal message to India in 1906.', '<p>The story of the Garrs is one of absolute obedience. Leaving their comforts behind, they traveled to Calcutta and established early assemblies, demonstrating dynamic spiritual leadership.</p>', NULL, NULL, 'cmqku2zbu00013u1qbthq3afd', true, 8, '2026-06-19 11:16:42.091', '2026-06-19 11:16:42.091', NULL);
INSERT INTO public."BlogPost" VALUES ('cmqku2zft007h3u1qbu9v4vdu', 'Arulappan: A Pioneer of Indigenous Leadership Training in India', 'arulappan-pioneer-indigenous-leadership', 'John Christian Arulappan was a Tamil evangelist who led one of the earliest Pentecostal revivals in South India.', '<p>John Christian Arulappan represents a powerful movement in early indigenous missions. His dedication to raises local leaders without relying on Western patterns paved the way for modern training ministries in rural India.</p>', NULL, NULL, 'cmqku2zbu00013u1qbthq3afd', true, 6, '2026-06-19 11:16:42.089', '2026-06-19 11:16:42.089', NULL);
INSERT INTO public."BlogPost" VALUES ('cmqku2zfu007j3u1qtf384kx1', '"They Will Not Go, I Must" — The Legacy of Mary Chapman', 'legacy-of-mary-chapman', 'Mary Weems Chapman, a 60-year-old veteran missionary, became the first Assemblies of God missionary to India.', '<p>Mary Chapman arrived in India at an age when most people prepare to retire. Her courage to establish ministries and serve rural populations stands as a monuments of faith and leadership.</p>', NULL, NULL, 'cmqku2zbu00013u1qbthq3afd', true, 7, '2026-06-19 11:16:42.09', '2026-06-19 11:16:42.09', NULL);


--
-- Data for Name: CertificateTemplate; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: Certificate; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: Coupon; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: CourseInvitation; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public."CourseInvitation" VALUES ('cmqm3tuv10001fzymvbwtj1zw', 'cmqm3bas20005pm88e08zdgem', 'cmql8quqk0000h58xt3rfj7uo', 'Join The Course', 'ACCEPTED', '2026-06-20 08:37:18.589', '2026-06-20 08:40:29.417');
INSERT INTO public."CourseInvitation" VALUES ('cmqm4y6500007fzymr0e9z2zx', 'cmqm4xmwo0005fzym9rhv5byg', 'cmqku2zbu00013u1qbthq3afd', 'Join the Course', 'ACCEPTED', '2026-06-20 09:08:39.444', '2026-06-20 09:09:55.582');


--
-- Data for Name: Curriculum; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public."Curriculum" VALUES ('cmqm60fxq0001yakbrdzo19v2', 'cmqm4xmwo0005fzym9rhv5byg', 'This course surveys the history of Christianity from the apostolic era to the modern church. Students will explore major movements, theological developments, councils, reformations, and influential Christian leaders that have shaped the church throughout history.', '["Trace the major periods of church history.","Understand significant theological developments.","Identify key figures and movements in Christianity.","Evaluate the impact of historical events on the contemporary church.","Apply lessons from church history to present-day ministry."]', '[]', NULL, '2026-06-20 09:38:25.07');
INSERT INTO public."Curriculum" VALUES ('cmqm63aq60003yakbot2u9ifc', 'cmqm3bas20005pm88e08zdgem', 'This course explores the biblical and theological foundations of pastoral ministry and Christian leadership. Students will examine the role of the pastor as a shepherd, servant, and leader while developing practical skills in pastoral care, discipleship, counseling, and church administration.', '["Understand the biblical role of a pastor.","Demonstrate principles of servant leadership.","Apply pastoral care and counseling techniques.","Develop strategies for discipleship and church growth.","Lead congregations with integrity and spiritual maturity."]', '[]', NULL, '2026-06-20 09:42:24.336');


--
-- Data for Name: Discussion; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: DiscussionReply; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: EmailTemplate; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public."EmailTemplate" VALUES ('cmq2987hd00001r46ctodgatb', 'WELCOME_EMAIL', 'Login Credentials', '<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Login Credentials</title>
</head>
<body style="margin:0; padding:0; background-color:#f4f6f9; font-family:Arial, sans-serif;">

    <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f6f9; padding:40px 0;">
        <tr>
            <td align="center">

                <table width="600" cellpadding="0" cellspacing="0" style="background-color:#ffffff; border-radius:10px; overflow:hidden; box-shadow:0 2px 10px rgba(0,0,0,0.1);">

                    <!-- Header -->
                    <tr>
                        <td align="center" style="background-color:#1e3a8a; padding:30px;">
                            <h1 style="color:#ffffff; margin:0;">Welcome!</h1>
                        </td>
                    </tr>

                    <!-- Content -->
                    <tr>
                        <td style="padding:40px; color:#333333; line-height:1.8; font-size:16px;">

                            <p>Dear <strong>{{name}}</strong>,</p>

                            <p>
                                Welcome to our platform. Your account has been successfully created.
                                Please find your login credentials below:
                            </p>

                            <table cellpadding="8" cellspacing="0" width="100%" style="background:#f8fafc; border:1px solid #e5e7eb; border-radius:8px;">
                                <tr>
                                    <td width="30%"><strong>Email:</strong></td>
                                    <td>{{email}}</td>
                                </tr>
                                <tr>
                                    <td><strong>Password:</strong></td>
                                    <td>{{password}}</td>
                                </tr>
                            </table>

                            <p style="margin-top:30px;">
                                For security purposes, we recommend changing your password after your first login.
                            </p>

                            <div style="text-align:center; margin:35px 0;">
                                <a href="{{login_url}}" style="background-color:#1e3a8a; color:#ffffff; text-decoration:none; padding:14px 30px; border-radius:6px; display:inline-block;">
                                    Login Now
                                </a>
                            </div>

                            <p>
                                If you have any questions or require assistance, please feel free to contact us.
                            </p>

                            <p>
                                Regards,<br>
                                <strong>CWAY Academy Team</strong>
                            </p>

                        </td>
                    </tr>

                    <!-- Footer -->
                    <tr>
                        <td align="center" style="background-color:#f8fafc; padding:20px; font-size:13px; color:#6b7280;">
                            © 2026 CWAY Academy. All rights reserved.
                        </td>
                    </tr>

                </table>

            </td>
        </tr>
    </table>

</body>
</html>', '[]', '2026-06-06 11:13:02.689', '2026-06-06 11:13:02.689');


--
-- Data for Name: Payment; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: Enrollment; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public."Enrollment" VALUES ('cmqnui4ba0001d427te28s7kk', 'cmqku2zbu00013u1qbthq3afd', 'cmqm4xmwo0005fzym9rhv5byg', '2026-06-21 13:51:46.774', NULL, 0, 'ACTIVE', NULL, NULL);


--
-- Data for Name: Extension; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: ExtensionRequest; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: Forum; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: ForumPost; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: ForumReply; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: LessonProgress; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: Message; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: Note; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: Notification; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public."Notification" VALUES ('cmqm3es9z0009pm88hqgecp70', 'cmql8quqk0000h58xt3rfj7uo', 'COURSE_INVITATION', 'You''ve been assigned a course', 'You have a new course invitation: "Pastoral Theology and Christian Leadership"', '/instructor/courses', false, '2026-06-20 08:25:35.4');
INSERT INTO public."Notification" VALUES ('cmqm3tuvc0003fzym8bq3opk2', 'cmql8quqk0000h58xt3rfj7uo', 'COURSE_INVITATION', 'You''ve been assigned a course', 'You have a new course invitation: "Pastoral Theology and Christian Leadership"', '/instructor/courses', false, '2026-06-20 08:37:18.601');
INSERT INTO public."Notification" VALUES ('cmqm4y65c0009fzym3c9exbgf', 'cmqku2zbu00013u1qbthq3afd', 'COURSE_INVITATION', 'You''ve been assigned a course', 'You have a new course invitation: "Church History and Historical Theology"', '/instructor/courses', false, '2026-06-20 09:08:39.456');


--
-- Data for Name: PayoutRequest; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: ProgramApplication; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: ProgramEnrollment; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: QuizAttempt; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: ReadingMaterial; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public."ReadingMaterial" VALUES ('cmqm7yqzc0007676pniigiguw', 'cmqm7o0px0001676p3m8poipq', 'Week 1 Mateial', NULL, 'https://pub-f282ad46200f49dc90b58a8a4e737923.r2.dev/reading-materials/cmqm7o0px0001676p3m8poipq/1781951583565-undefined-certificate.pdf', 'reading-materials/cmqm7o0px0001676p3m8poipq/1781951583565-undefined-certificate.pdf', 'pdf', 334959, 0, '2026-06-20 10:33:05.304');
INSERT INTO public."ReadingMaterial" VALUES ('cmqm7z6910009676pt9184nm4', 'cmqm7o0px0001676p3m8poipq', 'Week 1.2', NULL, 'https://pub-f282ad46200f49dc90b58a8a4e737923.r2.dev/reading-materials/cmqm7o0px0001676p3m8poipq/1781951603525-undefined-certificate--3-.pdf', 'reading-materials/cmqm7o0px0001676p3m8poipq/1781951603525-undefined-certificate--3-.pdf', 'pdf', 334959, 1, '2026-06-20 10:33:25.093');
INSERT INTO public."ReadingMaterial" VALUES ('cmqm87qik000m676p0bgi01un', 'cmqm84hxm000i676p1tz73xr2', 'Week 2 Material', NULL, 'https://pub-f282ad46200f49dc90b58a8a4e737923.r2.dev/reading-materials/cmqm84hxm000i676p1tz73xr2/1781952003828-undefined-certificate--1-.pdf', 'reading-materials/cmqm84hxm000i676p1tz73xr2/1781952003828-undefined-certificate--1-.pdf', 'pdf', 334959, 0, '2026-06-20 10:40:04.604');
INSERT INTO public."ReadingMaterial" VALUES ('cmqma8s0z0016fjtaisqfkrd5', 'cmqma3dhl0010fjta6rse61y7', 'Week 1 Material', NULL, 'https://pub-f282ad46200f49dc90b58a8a4e737923.r2.dev/reading-materials/cmqma3dhl0010fjta6rse61y7/1781955411103-Bible-Story.pdf', 'reading-materials/cmqma3dhl0010fjta6rse61y7/1781955411103-Bible-Story.pdf', 'pdf', 139145, 0, '2026-06-20 11:36:52.452');
INSERT INTO public."ReadingMaterial" VALUES ('cmqmatex8002gfjtank6d6kjw', 'cmqma4r8j0012fjtawds1ajg0', 'Week 2 Material', NULL, 'https://pub-f282ad46200f49dc90b58a8a4e737923.r2.dev/reading-materials/cmqma4r8j0012fjtawds1ajg0/1781956373587-undefined-certificate.pdf', 'reading-materials/cmqma4r8j0012fjtawds1ajg0/1781956373587-undefined-certificate.pdf', 'pdf', 334959, 0, '2026-06-20 11:52:55.245');


--
-- Data for Name: ReadingMaterialProgress; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: Review; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: RubricCriteria; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: RubricLevel; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: SiteSettings; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public."SiteSettings" VALUES ('cmqku2zfs007f3u1qauy3l7qd', 'CWAY Academy', NULL, 'Coach. Challenge. Commission.', 'support@cwayacademy.com', '+919663831220', '#C9973A', NULL, NULL, NULL, '2026-06-19 11:16:42.088');


--
-- Data for Name: Sponsorship; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: Submission; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: _prisma_migrations; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public._prisma_migrations VALUES ('edce18fe-2397-4e91-a054-e8c012145bd4', '5a22a5f113524a60e8cc93a92d15072d8728bd8fd0a7c072d414f99c90952dba', '2026-06-17 09:56:25.936779+00', '20260617095518_init_postgres', '', NULL, '2026-06-17 09:56:25.936779+00', 0);


--
-- PostgreSQL database dump complete
--

\unrestrict Pl3U6DG0rTqycMGwpNmL2Kk0dGu8lrOAWsCg1T3wCcj0jluczm25pAZhSrwmLbw

