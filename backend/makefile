# eCFR Analyzer Makefile
#
# Common usage:
#   make deploy ENV=dev
#   make deploy ENV=prod
#
# Build only one lambda zip:
#   make zip-ingest ENV=dev
#
# Deploy only one lambda:
#   make deploy-ingest ENV=dev
#
# Force rebuild layer:
#   make rebuild-layer ENV=dev
#
# Full reset:
#   make nuke && make deploy ENV=dev

.PHONY: deploy clean nuke check-aws-credentials \
        zip-all zip-layer generate-backend-config terraform-init terraform-apply \
        rebuild-layer rebuild-zips deploy-frontend \
        $(LAMBDAS:%=zip-%) $(LAMBDAS:%=deploy-%)

#####################################
# Config
#####################################

ENV ?= dev
PROJECT_NAME = ecfr
REGION ?= us-west-1

TERRAFORM_DIR = terraform
BUILD_DIR = $(TERRAFORM_DIR)/builds

LAYER_DIR = lambda_layer/python
LAYER_ZIP = $(BUILD_DIR)/python.zip
BACKEND_CONFIG_TMP = $(TERRAFORM_DIR)/backend.auto.hcl

# List all Lambda logical names (WITHOUT env suffix or .zip)
LAMBDAS = ingest get-agencies get-history get-summary

PYTHON_LAYER_IMAGE = public.ecr.aws/sam/build-python3.13
REQ_FILE = requirements.txt

# All source files (used as a coarse dependency signal for zips)
SRC_FILES := $(shell find src -type f)

#####################################
# Ensure build directory exists
#####################################

$(BUILD_DIR):
	mkdir -p $(BUILD_DIR)

#####################################
# Clean / Nuke
#####################################

clean:
	rm -f $(BUILD_DIR)/*.zip $(BACKEND_CONFIG_TMP)
	rm -rf $(LAYER_DIR)

nuke: clean
	rm -rf $(TERRAFORM_DIR)/.terraform $(TERRAFORM_DIR)/.terraform.lock.hcl

#####################################
# AWS Credentials Check
#####################################

check-aws-credentials:
	@echo "🔍 Checking AWS credentials..."
	@if [ -z "$$AWS_PROFILE" ] && [ -z "$$AWS_ACCESS_KEY_ID" ]; then \
		echo "❌ ERROR: AWS credentials not configured!"; \
		exit 1; \
	fi
	@aws sts get-caller-identity > /dev/null 2>&1 || \
		(echo "❌ ERROR: AWS credentials are invalid" && exit 1)
	@echo "✅ AWS credentials verified"

#####################################
# Backend config (file target)
#####################################

$(BACKEND_CONFIG_TMP):
	@echo "bucket = \"$(PROJECT_NAME)-terraform-state-bucket\"" > $(BACKEND_CONFIG_TMP)
	@echo "key    = \"$(PROJECT_NAME)/$(ENV)/terraform.tfstate\"" >> $(BACKEND_CONFIG_TMP)
	@echo "region = \"$(REGION)\"" >> $(BACKEND_CONFIG_TMP)

generate-backend-config: $(BACKEND_CONFIG_TMP)

#####################################
# Lambda Layer (incremental)
#####################################

$(LAYER_DIR)/.built: $(REQ_FILE)
	rm -rf $(LAYER_DIR)
	mkdir -p $(LAYER_DIR)
	docker run --rm \
		--platform linux/amd64 \
		-v $(CURDIR)/src:/var/task \
		-v $(CURDIR)/$(LAYER_DIR):/lambda/python \
		$(PYTHON_LAYER_IMAGE) \
		/bin/sh -c "pip3 install -r /var/task/requirements.txt -t /lambda/python --no-cache-dir"
	@touch $@

$(LAYER_ZIP): $(BUILD_DIR) $(LAYER_DIR)/.built
	cd lambda_layer && zip -r ../$(LAYER_ZIP) python > /dev/null

zip-layer: $(LAYER_ZIP)

#####################################
# Lambda zips (incremental)
#####################################

$(BUILD_DIR)/$(PROJECT_NAME)-%-$(ENV).zip: $(BUILD_DIR) $(SRC_FILES)
	cd src && zip -r ../$@ . > /dev/null

zip-%: $(BUILD_DIR)/$(PROJECT_NAME)-%-$(ENV).zip
	@echo "✅ Built $<"

zip-all: zip-layer $(LAMBDAS:%=$(BUILD_DIR)/$(PROJECT_NAME)-%-$(ENV).zip)

#####################################
# Terraform commands
#####################################

terraform-init: check-aws-credentials $(BACKEND_CONFIG_TMP)
	terraform -chdir=$(TERRAFORM_DIR) init -backend-config=$(notdir $(BACKEND_CONFIG_TMP))

terraform-apply:
	terraform -chdir=$(TERRAFORM_DIR) apply -var="environment=$(ENV)" -var="aws_region=$(REGION)" -auto-approve

#####################################
# Deploy
#####################################

deploy: zip-all terraform-init terraform-apply
	@echo "🚀 Deployed $(PROJECT_NAME) to environment: $(ENV)"

deploy-%: zip-% terraform-init terraform-apply
	@echo "🚀 Deployed lambda '$*' to environment: $(ENV)"

#####################################
# Force rebuild helpers
#####################################

rebuild-layer:
	rm -f $(LAYER_DIR)/.built $(LAYER_ZIP)
	$(MAKE) zip-layer ENV=$(ENV)

rebuild-zips:
	rm -f $(BUILD_DIR)/$(PROJECT_NAME)-*-$(ENV).zip
	$(MAKE) zip-all ENV=$(ENV)

#####################################
# Frontend deployment
#####################################

deploy-frontend:
	./deploy-frontend.sh $(ENV)
