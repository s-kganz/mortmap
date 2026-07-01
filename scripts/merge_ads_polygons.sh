#!/bin/bash

SURVEY_FIELDS="SURVEY_YEAR,IDS_DATA_SOURCE"
INPUT_DIRECTORY=data_in/ads
OUTPUT_DIRECTORY=data_working
DAMAGE_TEMP=$INPUT_DIRECTORY/damage_temp
SURVEY_TEMP=$INPUT_DIRECTORY/survey_temp

mkdir -p $DAMAGE_TEMP
mkdir -p $SURVEY_TEMP

for f in $INPUT_DIRECTORY/*.gdb; do
    bname=$(basename -- $f)
    region=${bname//[^0-9]/}
    damage_layer=DAMAGE_AREAS_FLAT_AllYears_CONUS_Rgn${region}
    survey_layer=SURVEYED_AREAS_FLAT_AllYears_CONUS_Rgn${region}

    # Following the FHP(R1-R4) method in Hicke et al. (2020).
    # If TPA exists, remap that to an AA class
    # If AA exists, remap that to 3 classes. Prefer AA over TPA
    damage_sql="
    SELECT SHAPE,SURVEY_YEAR,HOST_CODE,DCA_CODE,DAMAGE_TYPE_CODE,PERCENT_AFFECTED,LEGACY_TPA,
    CASE
        WHEN PERCENT_AFFECTED='Very Light (1-3%)' THEN 5
        WHEN PERCENT_AFFECTED='Light (4-10%)' THEN 5
        WHEN PERCENT_AFFECTED='Moderate (11-29%)' THEN 20
        WHEN PERCENT_AFFECTED='Severe (30-50%)' THEN 65
        WHEN PERCENT_AFFECTED='Very Severe (>50%)' THEN 65
        WHEN LEGACY_TPA > 0 AND LEGACY_TPA < 10 THEN 5
        WHEN LEGACY_TPA >= 10 AND LEGACY_TPA <= 30 THEN 20
        WHEN LEGACY_TPA >= 30 THEN 65
        ELSE NULL
    END AS SEVERITY,
    COALESCE(HOST, LEGACY_FOREST_TYPE) AS HOST_LABEL,
    COALESCE(DCA_COMMON_NAME, DAMAGE_TYPE) AS DCA_LABEL
    FROM $damage_layer
    "
    
    ogr2ogr $DAMAGE_TEMP/$bname $f -dialect SQLite -sql "$damage_sql" -nln damage -overwrite
    ogr2ogr $SURVEY_TEMP/$bname $f $survey_layer -select $SURVEY_FIELDS -overwrite
done

damage_files=$(find $DAMAGE_TEMP -maxdepth 1 -mindepth 1)
survey_files=$(find $SURVEY_TEMP -maxdepth 1 -mindepth 1)

echo $damage_files
echo $survey_files

ogrmerge -o $OUTPUT_DIRECTORY/damage.fgb $damage_files -f FlatGeoBuf -single -overwrite_ds -progress -s_srs "ESRI:102039" -t_srs "EPSG:5070"
ogrmerge -o $OUTPUT_DIRECTORY/survey.fgb $survey_files -f FlatGeoBuf -single -overwrite_ds -progress -s_srs "ESRI:102039" -t_srs "EPSG:5070"

rm -rf $DAMAGE_TEMP
rm -rf $SURVEY_TEMP