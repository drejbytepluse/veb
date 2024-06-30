CREATE TABLE user_data (
    `userId` varchar(32) NOT NULL,
    `cash` bigint,
    `bank` bigint,
    `items` json,
    PRIMARY KEY (userId)
) ENGINE=InnoDB CHARSET=utf8mb4;