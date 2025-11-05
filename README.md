# if not already a git repo
git init
git add .
git commit -m "Initial commit - ready for deploy"

# create GitHub repo named "monitoring" (replace with your GitHub username)
# on GitHub create a new repo and DON'T add README/.gitignore there (you already have them)

# then add remote & push
git branch -M main
git remote add origin https://github.com/Mizan510/monitoring.git
git push -u origin main
