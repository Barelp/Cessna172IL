## push

git add .
git commit -m "added new features"
git push 

והאתר יתעדכן מעצמו תוך כמה שניות!

## fetch
git fetch origin
git checkout main
git pull origin main
git merge origin/<branch_name_of_jules>
// -- git merge origin/fix-lint-errors-10567113878339074192
git push origin main

## revert
git log --oneline
git revert 958d7f3
git push origin main

## revert after merge
git revert -m 1 3aa4d48
git log --oneline -n 5