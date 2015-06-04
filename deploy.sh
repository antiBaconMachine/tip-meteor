#!/bin/sh
(cd packages/meta && ./meta.sh)
meteor deploy tip.meteor.com
