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

### Configuration (`config.json`)

```json
{
  "capture": {
    // Example
    // - on Linux systems:
    //     - eth0
    //     - enx000000000000
    // - on Windows systems:
    //     - \\Device\\NPF_{00000000-0000-0000-0000-000000000000} (note the escaped backslashes)
    "device": "eth0",
    // How often to store the gathered statistics, in seconds
    "interval": 1200,
    // The networks to gather statistics for
    // Example
    // - 0.0.0.0/0      (all addresses)
    // - 192.168.1.1/32 (single address)
    "networks": [
        "10.0.0.0/8",
        "172.16.0.0/12",
        "192.168.0.0/16"
    ]
  },
  "defaultGroup": "Other",
  "groups": {
    "Group 1": [
      "192.168.1.0/24"
    ],
    "Group 2": [
      "192.168.2.1/32",
      "192.168.2.2/32"
    ]
  }
}
```
