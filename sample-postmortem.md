# Emberlane Lobby incident report

This is an example for the fictional Incident Black Box case, The lobby went dark.

## What happened

On January 17, 2026, Emberlane Lobby stopped accepting players after release config `rev-18` went live. The first failed join check was at 23:52:17 UTC. The first passing check after the rollback was at 23:54:36 UTC.

## Evidence

| UTC | Source | What the entry shows |
| --- | --- | --- |
| 23:49:59 | Sign-in log | `sable` signed in to the staff dashboard from a new source. |
| 23:50:01 | Sign-in log | The dashboard issued that session read-only access. |
| 23:52:05 | Release log | The scheduled release activated `rev-18` and restarted the lobby. |
| 23:52:09 | Lobby log | Startup stopped on an unexpected key, `lobby_timout_ms`. The required `lobby_timeout_ms` key was missing. |
| 23:54:27 | Release log | The operator rolled back to `rev-17`. |
| 23:54:36 | Lobby log | The join check passed on `rev-17`. |

## What I'd check next

Ask the account owner to confirm the new sign-in and check whether other services picked up `rev-18`. Add config validation before a release goes live, then require a passing join check after restart.
