 # Bot for converting youtube links to mp3
 

Send a link from youtube and get an mp3 file as a result.

## Limitations: 
 - only 5 files per 24 hour for unregistered users.
 - up to 50 files for registered users
 - unlimited for Premium accounts 
 - not longer than 120 minutes long
 - not more than 100 Mb audio file

## Implementing limitations
We will store every incoming url in Redis.
Once new url was put in redis it will receive 'new' status and start downloading. Redis instance will have an ` user: user_id : url_hash ` 
as a key, and such fields:
+ user_id
+ chat_id
+ youtube url (yt.watch_url or video ID)
+ status - processing , ready , error
+ error_message (if occurred)
+ path - path of the saved file to send 

We will check current count of user's URLs by scanning redis for pattern: `user: *`.

we will store our files only 24 hour. So if one have the file to download which other user have requested within last 24 hour - we will try to find such file by scanning redis for pattern `user:*:url_hash`. If such file was found - we will send FileResponse at once, without downloading it again.