<?php
declare(strict_types=1);

namespace Backend;

class Config
{
  public const DB_HOST = 'localhost';
  public const DB_PORT = 3306;
  public const DB_NAME = 'college_events_db';
  public const DB_USER = 'root';
  public const DB_PASS = '';

  public const JWT_SECRET = 'change_this_dev_secret_key';
  public const JWT_EXP_HOURS = 24;
}


