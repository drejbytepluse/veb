CREATE TABLE income_role (
    `roleId` varchar(32) NOT NULL,
    `name` varchar(255),
    `desc` varchar(255),
    `minIncome` int,
    `maxIncome` int,
    `multiplier` DECIMAL(2,2),
    PRIMARY KEY (roleId)
) ENGINE=InnoDB CHARSET=utf8mb4;