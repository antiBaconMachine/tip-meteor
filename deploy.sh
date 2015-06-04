#!/bin/sh
(cd packages/meta && ./meta.sh)
git push && git push --tags
if [ -z "$1" ]
  then
    meteor deploy tip.meteor.com
fi

