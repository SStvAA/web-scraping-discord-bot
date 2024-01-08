<?php

// @formatter:off
/**
 * A helper file for your Eloquent Models
 * Copy the phpDocs from this file to the correct Model,
 * And remove them from this file, to prevent double declarations.
 *
 * @author Barry vd. Heuvel <barryvdh@gmail.com>
 */


namespace App\Models{
/**
 * App\Models\Account
 *
 * @property int $id
 * @property string $email
 * @property string $password
 * @property string $location
 * @property int $have_filters
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @method static \Illuminate\Database\Eloquent\Builder|Account newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder|Account newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder|Account query()
 * @method static \Illuminate\Database\Eloquent\Builder|Account whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Account whereEmail($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Account whereHaveFilters($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Account whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Account whereLocation($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Account wherePassword($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Account whereUpdatedAt($value)
 */
	class Account extends \Eloquent {}
}

namespace App\Models{
/**
 * App\Models\Monitor
 *
 * @property int $id
 * @property int $execution_time
 * @property mixed $notifications
 * @property mixed $workers
 * @property mixed $frontends
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @method static \Illuminate\Database\Eloquent\Builder|Monitor newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder|Monitor newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder|Monitor query()
 * @method static \Illuminate\Database\Eloquent\Builder|Monitor whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Monitor whereExecutionTime($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Monitor whereFrontends($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Monitor whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Monitor whereNotifications($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Monitor whereUpdatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Monitor whereWorkers($value)
 */
	class Monitor extends \Eloquent {}
}

namespace App\Models{
/**
 * App\Models\Proxy
 *
 * @property int $id
 * @property string $location
 * @property string $start_range_time
 * @property string $end_range_time
 * @property string $ip_address
 * @property string $port
 * @property string $username
 * @property string $password
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @method static \Illuminate\Database\Eloquent\Builder|Proxy newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder|Proxy newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder|Proxy query()
 * @method static \Illuminate\Database\Eloquent\Builder|Proxy whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Proxy whereEndRangeTime($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Proxy whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Proxy whereIpAddress($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Proxy whereLocation($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Proxy wherePassword($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Proxy wherePort($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Proxy whereStartRangeTime($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Proxy whereUpdatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Proxy whereUsername($value)
 */
	class Proxy extends \Eloquent {}
}

namespace App\Models{
/**
 * App\Models\Telegram
 *
 * @property int $id
 * @property string $bot_token
 * @property string $chat_id
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @method static \Illuminate\Database\Eloquent\Builder|Telegram newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder|Telegram newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder|Telegram query()
 * @method static \Illuminate\Database\Eloquent\Builder|Telegram whereBotToken($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Telegram whereChatId($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Telegram whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Telegram whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Telegram whereUpdatedAt($value)
 */
	class Telegram extends \Eloquent {}
}

namespace App\Models{
/**
 * App\Models\User
 *
 * @property int $id
 * @property string $name
 * @property string $email
 * @property \Illuminate\Support\Carbon|null $email_verified_at
 * @property string $password
 * @property string|null $two_factor_secret
 * @property string|null $two_factor_recovery_codes
 * @property string|null $two_factor_confirmed_at
 * @property string|null $remember_token
 * @property int|null $current_team_id
 * @property string|null $profile_photo_path
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property-read string $profile_photo_url
 * @property-read \Illuminate\Notifications\DatabaseNotificationCollection|\Illuminate\Notifications\DatabaseNotification[] $notifications
 * @property-read int|null $notifications_count
 * @property-read \Illuminate\Database\Eloquent\Collection|\Laravel\Sanctum\PersonalAccessToken[] $tokens
 * @property-read int|null $tokens_count
 * @method static \Database\Factories\UserFactory factory(...$parameters)
 * @method static \Illuminate\Database\Eloquent\Builder|User newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder|User newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder|User query()
 * @method static \Illuminate\Database\Eloquent\Builder|User whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder|User whereCurrentTeamId($value)
 * @method static \Illuminate\Database\Eloquent\Builder|User whereEmail($value)
 * @method static \Illuminate\Database\Eloquent\Builder|User whereEmailVerifiedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder|User whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder|User whereName($value)
 * @method static \Illuminate\Database\Eloquent\Builder|User wherePassword($value)
 * @method static \Illuminate\Database\Eloquent\Builder|User whereProfilePhotoPath($value)
 * @method static \Illuminate\Database\Eloquent\Builder|User whereRememberToken($value)
 * @method static \Illuminate\Database\Eloquent\Builder|User whereTwoFactorConfirmedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder|User whereTwoFactorRecoveryCodes($value)
 * @method static \Illuminate\Database\Eloquent\Builder|User whereTwoFactorSecret($value)
 * @method static \Illuminate\Database\Eloquent\Builder|User whereUpdatedAt($value)
 */
	class User extends \Eloquent {}
}

