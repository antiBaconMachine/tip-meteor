#!/bin/sh

clog=changelog.yaml
date=`date`

echo "- published: $date" > $clog

sort=`which gsort || which sort`
git for-each-ref --format="- %(refname:short): {date: \"%(taggerdate)\", msg: \"%(subject) %(body)\""} refs/tags | $sort -V >> $clog
