#!/bin/sh
(cd packages/meta && ./changelog.sh > changelog.yaml)
meteor deploy tip.meteor.com
