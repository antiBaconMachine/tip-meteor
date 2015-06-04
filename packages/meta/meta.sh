#!/bin/sh

file=meta.yaml
date=`date`

echo "published: $date" > $file
echo "changelog: " >> $file

sort=`which gsort || which sort`
git for-each-ref --format="    - %(refname:short): {date: \"%(taggerdate)\", msg: \"%(subject) %(body)\""} refs/tags | $sort -V >> $file
