const blackBoxCase = {
  id: 'lost-lobby',
  title: 'The lobby went dark',
  service: 'Emberlane Lobby',
  brief: 'Players stopped getting into Emberlane. A staff sign-in from a new address showed up a few minutes earlier. Pull the three logs, build a timeline, and call what took the lobby down.',
  sources: [
    {
      id: 'auth',
      label: 'Sign-in log',
      description: 'Staff dashboard sign-ins and session permissions.',
      events: [
        {
          id: 'auth-accepted',
          time: '2026-01-17T23:49:59Z',
          text: 'sable signed in from 192.0.2.44. The dashboard marked the source as new for this account.'
        },
        {
          id: 'auth-failed',
          time: '2026-01-17T23:49:48Z',
          text: 'sable had a failed dashboard sign-in from 192.0.2.44.'
        },
        {
          id: 'auth-scope',
          time: '2026-01-17T23:50:01Z',
          text: 'The dashboard issued sable a read-only session. It could view release status.'
        }
      ]
    },
    {
      id: 'deploy',
      label: 'Release log',
      description: 'Changes applied to the lobby and the rollback record.',
      events: [
        {
          id: 'deploy-staged',
          time: '2026-01-17T23:47:54Z',
          text: 'The release job staged config rev-18 for Emberlane Lobby.'
        },
        {
          id: 'deploy-activate',
          time: '2026-01-17T23:52:05Z',
          text: 'The scheduled release job activated config rev-18 and restarted Emberlane Lobby.'
        },
        {
          id: 'deploy-rollback',
          time: '2026-01-17T23:54:27Z',
          text: 'The operator rolled Emberlane Lobby back to config rev-17.'
        }
      ]
    },
    {
      id: 'service',
      label: 'Lobby log',
      description: 'Startup messages and join checks from the lobby.',
      events: [
        {
          id: 'service-ready',
          time: '2026-01-17T23:47:11Z',
          text: 'The join check passed. Emberlane Lobby was serving players on config rev-17.'
        },
        {
          id: 'service-start',
          time: '2026-01-17T23:52:09Z',
          text: 'Startup stopped on rev-18. Unknown key lobby_timout_ms. Required key lobby_timeout_ms is missing.'
        },
        {
          id: 'service-down',
          time: '2026-01-17T23:52:17Z',
          text: 'The join check failed. Emberlane Lobby was unavailable.'
        },
        {
          id: 'service-recovered',
          time: '2026-01-17T23:54:36Z',
          text: 'The join check passed after restart on rev-17. Players could join again.'
        }
      ]
    }
  ],
  causes: [
    {
      id: 'staff-session',
      label: 'The new staff session changed the lobby.',
      feedback: 'Check the session permissions. What could the signed-in account do in the dashboard?'
    },
    {
      id: 'config-revision',
      label: 'The release applied a config the lobby could not load.',
      feedback: 'Connect the session permissions, the release that went live, and the startup error with a log entry for each.'
    },
    {
      id: 'traffic',
      label: 'A rush of players overloaded the lobby.',
      feedback: 'The join check tells you when the lobby was down. Look for an earlier event that explains what stopped it.'
    }
  ],
  correctCause: 'config-revision',
  requiredEvidence: ['auth-scope', 'deploy-activate', 'service-start'],
  summary: 'The release job applied rev-18, and the lobby stopped at startup because the timeout key was misspelled. The lobby recovered on rev-17 after the rollback. The earlier dashboard session was read-only.',
  takeaways: [
    'The account owner still needs to confirm the sign-in from the new address.',
    'Check whether any other service picked up rev-18. The logs here cover Emberlane Lobby and its dashboard.'
  ]
};
