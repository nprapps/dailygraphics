INPUT_DATA_DIR=scripts/data
PATCHED_PYM_LOCATION=scripts/pym-patched/pym.js
INPUT_GRAPHICS_FILE=pym_vuln_impacted_inventory.csv
OUTPUT_DATA_DIR=scripts/logs


.PHONY: all search_local_pym search_pym_oldcode patch_local_pym replace_pym_oldcode replace_pym_push_cdn replace_pym_script_cdn republish_staging republish_production clean

all:
	@echo "No default action, please specify the target you want to use"

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

search_local_pym: $(INPUT_DATA_DIR)/local_pym.csv
	@echo "Finished local pym search"	

$(INPUT_DATA_DIR)/local_pym.csv: $(INPUT_DATA_DIR)
	./scripts/search_local_pym.sh ../graphics-archive > $@

search_pym_oldcode: $(INPUT_DATA_DIR)/pym_oldcode.csv
	@echo "Finished pym old code search"	

$(INPUT_DATA_DIR)/pym_oldcode.csv: $(INPUT_DATA_DIR)
	./scripts/search_old_pym_code.sh ../graphics-archive > $@

replace_pym_oldcode: $(INPUT_DATA_DIR)/pym_oldcode_clean.csv
	cat $< | parallel ./scripts/replace_old_pym_code.sh {}

replace_pym_push_cdn: $(INPUT_DATA_DIR)/local_pym_push_clean.csv
	cat $< | parallel ./scripts/replace_pym_push_cdn.sh {}

replace_pym_script_cdn: $(INPUT_DATA_DIR)/local_pym_script_clean.csv
	cat $< | parallel ./scripts/replace_pym_script_cdn.sh {}

patch_local_pym: $(INPUT_DATA_DIR)/local_pym_graphics.csv $(PATCHED_PYM_LOCATION)
	cat $< | parallel ./scripts/patch_pym.sh {}

# Aux rules
$(OUTPUT_DATA_DIR):
	mkdir -p $(OUTPUT_DATA_DIR)

$(INPUT_DATA_DIR):
	mkdir -p $(INPUT_DATA_DIR)

clean:
	rm -rf $(INPUT_DATA_DIR)
	rm -rf $(OUTPUT_DATA_DIR)