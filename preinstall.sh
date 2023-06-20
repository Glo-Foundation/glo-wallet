echo "Preinstall script"

if [[ $NEXT_PUBLIC_VERCEL_ENV = "production" ]]
then
    cat vercel.json
    sed -i "s/\$VERCEL_WEBHOOK_KEY/$VERCEL_WEBHOOK_KEY/" vercel.json
    echo "File vercel.json populated with secret key"
else
    echo "Skipping preinstall script on localhost"
fi