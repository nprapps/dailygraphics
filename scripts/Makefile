INPUT_DATA_DIR=scripts/data
PATCHED_PYM_LOCATION=scripts/pym-patched/pym.js
INPUT_GRAPHICS_FILE=pym_vuln_impacted_inventory.csv
OUTPUT_DATA_DIR=scripts/logs


.PHONY: all pepe search_local_pym search_pym_oldcode patch_local_pym replace_pym_oldcode replace_pym_push_cdn replace_pym_script_cdn republish_staging republish_production clean

all:
	@echo "No default action, please specify the target you want to use"

search_pym_oldcode: $(INPUT_DATA_DIR)/pym_oldcode.txt
	@echo "Finished pym old code search"

search_local_pym: $(INPUT_DATA_DIR)/local_pym.txt
	@echo "Finished local pym search"	

patch_local_pym: $(INPUT_DATA_DIR)/local_pym_graphics.csv $(PATCHED_PYM_LOCATION)
	cat $< | parallel ./scripts/patch_pym.sh {}

replace_pym_oldcode: $(INPUT_DATA_DIR)/pym_oldcode_clean.txt
	cat $< | parallel ./scripts/replace_old_pym_code.sh {}

replace_pym_push_cdn: $(INPUT_DATA_DIR)/local_pym_push_clean.txt
	cat $< | parallel ./scripts/replace_pym_push_cdn.sh {}

replace_pym_script_cdn: $(INPUT_DATA_DIR)/local_pym_script_clean.txt
	cat $< | parallel ./scripts/replace_pym_script_cdn.sh {}

republish_staging: $(OUTPUT_DATA_DIR)/staging_deployment_log.txt
	@echo "Finished deployment to staging"

republish_production: $(OUTPUT_DATA_DIR)/production_deployment_log.txt
	@echo "Finished deployment to production"

$(OUTPUT_DATA_DIR)/staging_deployment_log.txt: $(INPUT_DATA_DIR)/$(INPUT_GRAPHICS_FILE) $(OUTPUT_DATA_DIR)
	echo "" > $@
	cat $< | parallel fab staging deploy:{} >> $@

$(OUTPUT_DATA_DIR)/production_deployment_log.txt: $(INPUT_DATA_DIR)/$(INPUT_GRAPHICS_FILE) $(OUTPUT_DATA_DIR)
	echo "" > $@
	cat $< | parallel fab production deploy:{} >> $@

$(INPUT_DATA_DIR)/pym_oldcode_clean.txt: $(INPUT_DATA_DIR)/pym_oldcode.txt
	cat $< | ./scripts/clean_find_results.py > $@

$(INPUT_DATA_DIR)/local_pym_push_clean.txt: $(INPUT_DATA_DIR)/local_pym.txt
	cat ./scripts/pym_references_research.csv | ./scripts/clean_find_results.py -r push | ./scripts/dedupe_graphics_folders.py > $@

$(INPUT_DATA_DIR)/local_pym_script_clean.txt: $(INPUT_DATA_DIR)/local_pym.txt
	cat ./scripts/pym_test_references.csv | ./scripts/clean_find_results.py -r script | ./scripts/dedupe_graphics_folders.py > $@

$(INPUT_DATA_DIR)/pym_oldcode.txt: $(INPUT_DATA_DIR)
	./scripts/search_old_pym_code.sh ../graphics-archive > $@

$(INPUT_DATA_DIR)/local_pym.txt: $(INPUT_DATA_DIR)
	./scripts/search_local_pym.sh ../graphics-archive > $@

# Aux rules
$(OUTPUT_DATA_DIR):
	mkdir -p $(OUTPUT_DATA_DIR)

$(INPUT_DATA_DIR):
	mkdir -p $(INPUT_DATA_DIR)

clean:
	rm -rf $(INPUT_DATA_DIR)
	rm -rf $(OUTPUT_DATA_DIR)