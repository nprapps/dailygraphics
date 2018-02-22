INPUT_DATA_DIR=scripts/data
INPUT_GRAPHICS_FILE=test_pym-vuln-impacted-inventory.csv
OUTPUT_DATA_DIR=scripts/logs


.PHONY: all republish_staging republish_production clean

all:
	@echo "No default action, please specify the deployment target:\n\t- make republish_staging\n\t- make republish_production"

republish_staging: $(OUTPUT_DATA_DIR)/staging_deployment_log.txt
	@echo "Finished deployment to staging"

$(OUTPUT_DATA_DIR)/staging_deployment_log.txt: $(INPUT_DATA_DIR)/$(INPUT_GRAPHICS_FILE) $(OUTPUT_DATA_DIR)
	echo "" > $@
	cat $< | parallel fab staging deploy:{} >> $@

republish_production: $(OUTPUT_DATA_DIR)/production_deployment_log.txt
	@echo "Finished deployment to production"

$(OUTPUT_DATA_DIR)/production_deployment_log.txt: $(INPUT_DATA_DIR)/$(INPUT_GRAPHICS_FILE) $(OUTPUT_DATA_DIR)
	echo "" > $@
	cat $< | parallel fab production deploy:{} >> $@

# Aux rules
$(OUTPUT_DATA_DIR):
	mkdir -p $(OUTPUT_DATA_DIR)

clean:
	rm -rf $(OUTPUT_DATA_DIR)