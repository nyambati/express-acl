# Abstract major development commands
SHELL = /bin/sh

# Run tests for local development
test:
	docker build -t express-acl/constable .
	docker run -i -t express-acl/constable

# serve mkdocs during development
mk_docs:
	pip install mkdocs >/dev/null 2>&1

serve: mk_docs
	mkdocs serve

# Deploy documentatin to github
deploy: mk_docs
	mkdocs gh-deploy --clean /

# remove sites and coverage folders
clean:
	rm -rf sites coverage

rmi:
	docker rmi express-acl/constable --force


