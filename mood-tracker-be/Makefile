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