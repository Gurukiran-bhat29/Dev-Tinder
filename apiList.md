# DevTinder Apis

## Auth router
- POST /signUp
- POST /login
- POST /logout

## Profile router
- GET /profile/view
- PATCH /profile/edit
- PATCH /profile/password

## Connection request router
- POST /request/send/intrested/:userId
- POST /request/send/ignored/:userId
- POST /request/review/accepted/:requestId
- POST /request/review/rejected/:requestId

## User router
- GET /user/connections
- GET /user/request/received
- GET /user/feed - Gets you the user of other users on the platform

Status: ignore, intrested, accepted and rejected