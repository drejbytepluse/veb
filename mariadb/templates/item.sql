CREATE TABLE item (
    `itemId` int AUTO_INCREMENT NOT NULL,
    `itemName` varchar(255),
    `desc` varchar(255),
    `price` int,
    PRIMARY KEY (itemId)
) ENGINE=InnoDB CHARSET=utf8mb4;