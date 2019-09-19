# net-log

## Installation

### Database creation

Create the database using the script below, and then use `.env` to configure how the application connects to it.

```sql
CREATE DATABASE net_log;
GRANT ALL PRIVILEGES ON net_log.* TO `net_log`@`localhost` IDENTIFIED BY "<password>";

USE net_log;
CREATE TABLE period_stat (
    period_start DATETIME          NOT NULL,
    period_len   INTEGER  UNSIGNED NOT NULL,
    ip_addr      INTEGER  UNSIGNED NOT NULL,
    bytes_in     BIGINT   UNSIGNED NOT NULL,
    bytes_out    BIGINT   UNSIGNED NOT NULL,
    packets      BIGINT   UNSIGNED NOT NULL,
    PRIMARY KEY (period_start, ip_addr)
);
```
