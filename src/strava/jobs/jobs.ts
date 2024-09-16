export const STRAVA_ATHLETE_ADDED_JOB = 'strava-athlete-added';

export interface StravaAthleteAddedJob {
  athleteId: number;
  stravaAthleteId: number;
}

export const STRAVA_ACTIVITY_CREATED_JOB = 'strava-activity-created';

export interface StravaActivityCreatedJob {
  stravaAthleteId: number;
  stravaActivityId: bigint;
}

export const STRAVA_ACTIVITY_DELETED_JOB = 'strava-activity-deleted';

export interface StravaActivityDeletedJob {
  stravaAthleteId: number;
  stravaActivityId: bigint;
}

export const STRAVA_ACTIVITY_UPDATED_JOB = 'strava-activity-updated';

export interface StravaActivityUpdatedJob {
  stravaAthleteId: number;
  stravaActivityId: bigint;
  activityType: string;
}

export const STRAVA_BACKFILL_JOB = 'strava-backfill';

export interface StravaBackfillJob {
  athleteId: number;
}

export const STRAVA_ACTIVITY_ANALYSIS_JOB = 'strava-activity-analysis';

export interface StravaActivityAnalysisJob {
  stravaAthleteId: number;
  stravaActivityId: bigint;
}
