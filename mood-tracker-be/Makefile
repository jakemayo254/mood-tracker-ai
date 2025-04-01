.PHONY: format lint check autofix

format:
	black .
	isort .

lint:
	flake8 .

check: lint format

autofix:
	black .
	isort .

clean-reqs:
	sort -u requirements.txt -o requirements.txt

clean: autofix clean-reqs
