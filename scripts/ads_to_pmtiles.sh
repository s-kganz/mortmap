#!/bin/bash

YEAR_MIN=1999
YEAR_MAX=2023

for yr in $(seq $YEAR_MIN $YEAR_MAX); do
    echo $yr
    
    # Make temp copy of the data in this year and in EPSG:4326
    ogr2ogr /tmp/damage_$yr.fgb data_working/damage.fgb -t_srs EPSG:4326 -where "\"SURVEY_YEAR\" = $yr"
    ogr2ogr /tmp/survey_$yr.fgb data_working/survey.fgb -t_srs EPSG:4326 -where "\"SURVEY_YEAR\" = $yr"

    # Convert to pmtiles
    ~/tippecanoe -zg -l damage -o data_working/damage_pmtiles/damage_$yr.pmtiles /tmp/damage_$yr.fgb --drop-densest-as-needed --force
    ~/tippecanoe -zg -l damage -o data_working/survey_pmtiles/survey_$yr.pmtiles /tmp/survey_$yr.fgb --drop-densest-as-needed --force
    
    # Remove tmp file
    rm /tmp/damage_$yr.fgb
    rm /tmp/survey_$yr.fgb
done