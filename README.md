# For addition and deletion any field..
update backend side
model/Record.js
routes/records.js

update frontend side
frontend/src/components/SubmitForm.jsx
frontend/src/components/Reports.jsx

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



# after any change & push
git add .
git commit -m "Something Updated"
git push origin main



# Make any change → save → commit → push to GitHub →
# Vercel and Render automatically rebuild → your live site updates.