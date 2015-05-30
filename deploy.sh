#!/bin/sh
(cd packages/meta && ./changelog.sh > changelog.yaml)
meteor deploy tip.metoer.com
