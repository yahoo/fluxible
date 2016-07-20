#!/bin/sh
git pull
npm version patch
PACKAGE=$(npm pack)
echo PACKAGE: $PACKAGE
curl -F package=@$PACKAGE https://C__hqNZ_HngaWmEnB-ps@push.fury.io/massdrop/
rm $PACKAGE
git push