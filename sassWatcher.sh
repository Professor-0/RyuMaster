files=$(ls app/style)

while read file; do
  if [[ "$file" == *".scss"* ]]; then
    sass --watch "app/style/$file":"app/style/$(basename "$file" .scss).css" &
    echo "Watching app/style/$file:app/style/$(basename "$file" .scss).css";
  fi

done <<< "$files"

wait
