#!/bin/sh

# Replace env vars in JavaScript files
echo "Replacing env vars in JS"
for file in /usr/share/nginx/html/js/app.*.js;
do
  echo "Processing $file ...";

  # Use the existing JS file as template
  if [ ! -f $file.tmpl.js ]; then
    cp $file $file.tmpl.js
  fi

  envsubst '$VUE_APP_CLIENT_ID,$VUE_APP_CLIENT_SEC,$VUE_APP_REDIRECT_URI,$VUE_APP_CUSTOS_API_URL,$VUE_APP_SUPER_CLIENT_ID' < $file.tmpl.js > $file
done

echo "Starting Nginx"
nginx -g 'daemon off;'