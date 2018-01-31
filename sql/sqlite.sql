CREATE TABLE IF NOT EXISTS `workouts` (
  `id` INTEGER PRIMARY KEY AUTOINCREMENT,
  `title` varchar(200) NOT NULL,
  `value` varchar(5000) NOT NULL,
  `tags` varchar(100) DEFAULT NULL,
  `creation_ts` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `duration_sec` int(11) DEFAULT NULL,
  `tss` int(11) DEFAULT NULL,
  `sport_type` int(11) DEFAULT '0'
);