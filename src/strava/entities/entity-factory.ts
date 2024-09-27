import { StravaAthlete } from './strava-athlete.entity';
import { StravaActivity } from './strava-activity.entity';
import {
  SimpleStravaApiActivity,
  StravaApiActivity,
  StravaTokenResponse,
  StravaTokenResponseWithAthlete,
} from '../strava-api.service';
import { StravaAchievementEffort } from './strava-achievement-effort.entity';
import { StravaSegment } from './strava-segment.entity';
import { StravaSegmentEffort } from './strava-segment-effort.entity';
import { StravaCredentials } from './strava-credentials.entity';
import { User } from '../../user/user.entity';

export function createStravaActivityRecord(
  activity: StravaApiActivity | SimpleStravaApiActivity,
  athlete: StravaAthlete,
): StravaActivity {
  const activityRecord = new StravaActivity();
  activityRecord.stravaId = activity.id;
  activityRecord.athlete = Promise.resolve(athlete);
  activityRecord.name = activity.name;
  activityRecord.distance = Math.round(activity.distance * 100);
  activityRecord.movingTime = activity.moving_time;
  activityRecord.elapsedTime = activity.elapsed_time;
  activityRecord.totalElevationGain = Math.round(
    activity.total_elevation_gain * 100,
  );
  activityRecord.sportType = activity.type;
  activityRecord.startDate = new Date(activity.start_date);
  return activityRecord;
}

export function createStravaSAchievementEffortRecord(
  activityBestEffort: any,
  stravaActivity: StravaActivity,
  athlete: StravaAthlete,
): StravaAchievementEffort {
  const achievementEffort = new StravaAchievementEffort();
  achievementEffort.stravaId = activityBestEffort.id.toString(); // BigInt to string
  achievementEffort.athlete = Promise.resolve(athlete);
  achievementEffort.activity = Promise.resolve(stravaActivity);
  achievementEffort.effortName = activityBestEffort.name;
  achievementEffort.elapsedTime = activityBestEffort.elapsed_time;
  achievementEffort.movingTime = activityBestEffort.moving_time;
  achievementEffort.startDate = new Date(activityBestEffort.start_date);
  return achievementEffort;
}

export function createStravaSegmentEffortRecord(
  stravaSegmentEffort: any,
  segment: StravaSegment,
  stravaActivity: StravaActivity,
  stravaAthlete: StravaAthlete,
): StravaSegmentEffort {
  const segmentEffort = new StravaSegmentEffort();
  segmentEffort.stravaId = stravaSegmentEffort.id.toString(); // BigInt to string
  segmentEffort.activity = Promise.resolve(stravaActivity);
  segmentEffort.segment = Promise.resolve(segment);
  segmentEffort.athlete = Promise.resolve(stravaAthlete);
  segmentEffort.elapsedTime = stravaSegmentEffort.elapsed_time;
  segmentEffort.movingTime = stravaSegmentEffort.moving_time;
  segmentEffort.startDate = new Date(stravaSegmentEffort.start_date);
  return segmentEffort;
}

export function createStravaAthleteRecord(
  response: StravaTokenResponseWithAthlete,
  stravaCredentials: StravaCredentials,
  user: User,
) {
  const stravaAthlete = new StravaAthlete();
  stravaAthlete.stravaId = response.athlete.id;
  stravaAthlete.firstName = response.athlete.firstname;
  stravaAthlete.lastName = response.athlete.lastname;
  stravaAthlete.profileUrl = response.athlete.profile;
  stravaAthlete.credentials = Promise.resolve(stravaCredentials);
  stravaAthlete.user = Promise.resolve(user);
  return stravaAthlete;
}

export function createCredentialsRecord(response: StravaTokenResponse) {
  const stravaCredentials: StravaCredentials = new StravaCredentials();
  stravaCredentials.accessToken = response.access_token;
  stravaCredentials.refreshToken = response.refresh_token;
  stravaCredentials.tokenExpiresAt = new Date(response.expires_at * 1000);
  return stravaCredentials;
}
