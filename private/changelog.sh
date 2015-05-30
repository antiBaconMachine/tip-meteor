#!/bin/sh
git for-each-ref --format="- %(refname:short): {date: \"%(taggerdate)\", msg: \"%(subject) %(body)\""} refs/tags
