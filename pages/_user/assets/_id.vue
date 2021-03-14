<template>
  <v-container
    fluid
    :class="{
      'px-3 pt-0': $vuetify.breakpoint.mdAndUp,
      'pa-1': $vuetify.breakpoint.smAndDown
    }"
  >
    <v-row
      class="pb-5"
    >
      <v-col
        cols="12"
        class="pb-5"
      >
        <v-card
          v-if="assetReady"
        >
          <v-card-title
            primary-title
            class="display-1 primary white--text"
          >
            <v-icon>
              mdi-devices
            </v-icon>
            &nbsp;
            <span
              v-for="(tag, index) in asset.tag"
              :key="index"
            >
              <span
                :class="{
                  'display-1': index === 0,
                  'caption': index !== 0
                }"
              >
                {{ tag }}
                &nbsp;
              </span>
            </span>
            <v-spacer />
            <v-switch
              v-model="asset.active"
              color="white"
              :label="(asset.active === false) ? 'Inactive' : 'Active'"
              @change="$forceUpdate()"
            />
          </v-card-title>
          <v-card-title
            v-show="asset.assetId"
            class="caption pt-1 pb-0"
          >
            Asset ID: {{ asset.assetId }}
          </v-card-title>
          <v-card-title
            v-show="asset.addedBy"
            class="caption pt-1 pb-0"
          >
            Added By: {{ asset.addedBy }}&nbsp;
            <span
              v-if="asset.addedDate && asset.addedDate !== '/  /'"
            >
              on {{ processDate(asset.addedDate, 'date') }}&nbsp;
            </span>
            <span
              v-if="asset.addedTime"
            >
              at {{ processDate(asset.addedTime, 'time') }}
            </span>
          </v-card-title>
          <v-card-title
            v-show="asset.editedBy"
            class="caption pt-1 pb-3"
          >
            Edited By: {{ asset.editedBy }}&nbsp;
            <span
              v-if="asset.editedDate && asset.editedDate !== '/  /'"
            >
              on {{ processDate(asset.editedDate, 'date') }}&nbsp;
            </span>
            <span
              v-if="asset.editedTime"
            >
              at {{ processDate(asset.editedTime, 'time') }}
            </span>
          </v-card-title>
          <v-divider />
          <v-card-text>
            <v-row>
              <v-col
                cols="12"
                md="4"
                :class="{
                  'pr-2': $vuetify.breakpoint.mdAndUp
                }"
              >
                <v-btn
                  color="primary"
                  depressed
                  @click="assetDialog = true"
                >
                  Change Tag
                </v-btn>
                <v-dialog
                  v-model="assetDialog"
                  persistent
                  width="500"
                >
                  <v-card>
                    <v-card-title
                      class="primary white--text"
                    >
                      Change Asset Tag
                    </v-card-title>
                    <v-card-text
                      class="subtitle-1 pt-5"
                    >
                      Change the tag this asset uses. Please note you will still need to hit Save at the bottom of the page for these changes to take place.
                    </v-card-text>
                    <v-card-text>
                      <v-text-field
                        v-model="newTag"
                        :error-messages="tagErrors"
                        name="tag"
                        placeholder="New Tag"
                        label="New Tag"
                        autocomplete="new-password"
                        required
                        :outlined="$vuetify.breakpoint.mdAndUp"
                      />
                    </v-card-text>
                    <v-divider />
                    <v-card-actions>
                      <v-btn
                        color="secondary"
                        text
                        @click="assetDialog = false"
                      >
                        Cancel
                      </v-btn>
                      <v-spacer />
                      <v-btn
                        color="primary"
                        depressed
                        @click="saveNewTag"
                      >
                        Apply
                      </v-btn>
                    </v-card-actions>
                  </v-card>
                </v-dialog>
              </v-col>
              <v-col
                cols="12"
                md="4"
                :class="{
                  'pl-2 pr-2': $vuetify.breakpoint.mdAndUp
                }"
              >
                <v-text-field
                  v-model="asset.assetType"
                  name="assetType"
                  label="Asset Type"
                  placeholder="Asset Type"
                  autocomplete="new-password"
                  :outlined="$vuetify.breakpoint.mdAndUp"
                />
              </v-col>
              <v-col
                cols="12"
                md="4"
                :class="{
                  'pl-2': $vuetify.breakpoint.mdAndUp
                }"
              >
                <v-text-field
                  v-model="asset.serial"
                  name="serial"
                  label="Asset Serial Number"
                  placeholder="Asset Serial Number"
                  autocomplete="new-password"
                  :outlined="$vuetify.breakpoint.mdAndUp"
                />
              </v-col>
              <v-col
                v-if="assetDepartment === 'it'"
                cols="12"
                md="4"
                :class="{
                  'pr-2': $vuetify.breakpoint.mdAndUp
                }"
              >
                <v-select
                  v-show="$vuetify.breakpoint.smAndDown"
                  v-model="asset.manufacturer"
                  :items="manufacturers"
                  item-text="text"
                  item-value="value"
                  name="manufacturer"
                  :outlined="$vuetify.breakpoint.mdAndUp"
                  autocomplete="new-password"
                  label="Asset Manufacturer"
                  placeholder="Asset Manufacturer"
                />
                <v-autocomplete
                  v-show="$vuetify.breakpoint.mdAndUp"
                  v-model="asset.manufacturer"
                  :items="manufacturers"
                  item-text="text"
                  item-value="value"
                  name="manufacturer"
                  :outlined="$vuetify.breakpoint.mdAndUp"
                  autocomplete="new-password"
                  label="Asset Manufacturer"
                  placeholder="Asset Manufacturer"
                />
              </v-col>
              <v-col
                v-else
                cols="12"
                md="4"
                :class="{
                  'pr-2': $vuetify.breakpoint.mdAndUp
                }"
              >
                <v-text-field
                  v-model="asset.manufacturer"
                  name="manufacturer"
                  :outlined="$vuetify.breakpoint.mdAndUp"
                  autocomplete="new-password"
                  label="Asset Manufacturer"
                  placeholder="Asset Manufacturer"
                />
              </v-col>
              <v-col
                v-if="assetDepartment === 'it'"
                cols="12"
                md="4"
                :class="{
                  'pl-2 pr-2': $vuetify.breakpoint.mdAndUp
                }"
              >
                <v-select
                  v-show="$vuetify.breakpoint.smAndDown"
                  v-model="asset.modelNumber"
                  :items="models"
                  item-text="text"
                  item-value="value"
                  name="modelNumber"
                  :outlined="$vuetify.breakpoint.mdAndUp"
                  autocomplete="new-password"
                  label="Asset Model"
                  placeholder="Asset Model"
                />
                <v-autocomplete
                  v-show="$vuetify.breakpoint.mdAndUp"
                  v-model="asset.modelNumber"
                  :items="models"
                  item-text="text"
                  item-value="value"
                  name="modelNumber"
                  :outlined="$vuetify.breakpoint.mdAndUp"
                  label="Asset Model"
                  placeholder="Asset Model"
                />
              </v-col>
              <v-col
                v-else
                cols="12"
                md="4"
                :class="{
                  'pr-2': $vuetify.breakpoint.mdAndUp
                }"
              >
                <v-text-field
                  v-model="asset.modelNumber"
                  name="manufacturer"
                  :outlined="$vuetify.breakpoint.mdAndUp"
                  label="Asset Model"
                  autocomplete="new-password"
                  placeholder="Asset Model"
                />
              </v-col>
              <v-col
                cols="12"
                md="4"
                :class="{
                  'pl-2': $vuetify.breakpoint.mdAndUp
                }"
              >
                <v-text-field
                  v-model="asset.description"
                  name="description"
                  label="Asset Description"
                  placeholder="Asset Description"
                  autocomplete="new-password"
                  :outlined="$vuetify.breakpoint.mdAndUp"
                />
              </v-col>
              <v-col
                cols="12"
                md="4"
                :class="{
                  'pr-2': $vuetify.breakpoint.mdAndUp
                }"
              >
                <v-autocomplete
                  v-if="$vuetify.breakpoint.mdAndUp"
                  v-model="asset.userId"
                  :items="users"
                  item-text="text"
                  item-value="value"
                  name="userId"
                  :outlined="$vuetify.breakpoint.mdAndUp"
                  search-input
                  autocomplete="new-password"
                  label="Staff Asset is Assigned To (Not for PM)"
                  placeholder="Staff Asset is Assigned To (Not for PM)"
                />
                <v-select
                  v-else
                  v-model="asset.userId"
                  :items="users"
                  item-text="text"
                  item-value="value"
                  name="userId"
                  search-input
                  autocomplete="new-password"
                  :outlined="$vuetify.breakpoint.mdAndUp"
                  label="Staff Asset is Assigned To (Not for PM)"
                  placeholder="Staff Asset is Assigned To (Not for PM)"
                />
              </v-col>
              <v-col
                cols="12"
                md="4"
                :class="{
                  'pl-2 pr-2': $vuetify.breakpoint.mdAndUp
                }"
              >
                <v-select
                  v-show="$vuetify.breakpoint.smAndDown"
                  v-model="asset.building"
                  :items="buildings"
                  name="building"
                  :outlined="$vuetify.breakpoint.mdAndUp"
                  autocomplete="new-password"
                  label="Building where Asset is Located"
                  placeholder="Building where Asset is Located"
                />
                <v-autocomplete
                  v-show="$vuetify.breakpoint.mdAndUp"
                  v-model="asset.building"
                  :items="buildings"
                  name="building"
                  :outlined="$vuetify.breakpoint.mdAndUp"
                  autocomplete="new-password"
                  label="Building where Asset is Located"
                  placeholder="Building where Asset is Located"
                />
              </v-col>
              <v-col
                cols="12"
                md="4"
                :class="{
                  'pl-2 pr-2': $vuetify.breakpoint.mdAndUp
                }"
              >
                <v-select
                  v-show="$vuetify.breakpoint.smAndDown"
                  v-model="asset.departmentIn"
                  :items="departments"
                  name="departmentIn"
                  :outlined="$vuetify.breakpoint.mdAndUp"
                  label="Department where Asset is Located"
                  autocomplete="new-password"
                  placeholder="Department where Asset is Located"
                />
                <v-autocomplete
                  v-show="$vuetify.breakpoint.mdAndUp"
                  v-model="asset.departmentIn"
                  :items="departments"
                  name="departmentIn"
                  :outlined="$vuetify.breakpoint.mdAndUp"
                  autocomplete="new-password"
                  label="Department where Asset is Located"
                  placeholder="Department where Asset is Located"
                />
              </v-col>
              <v-col
                cols="12"
                md="4"
                :class="{
                  'pl-2': $vuetify.breakpoint.mdAndUp
                }"
              >
                <v-text-field
                  v-model="asset.cost"
                  name="cost"
                  :outlined="$vuetify.breakpoint.mdAndUp"
                  autocomplete="new-password"
                  label="Asset Cost"
                  placeholder="Asset Cost"
                />
              </v-col>
              <v-col
                cols="12"
                md="4"
                :class="{
                  'pr-2': $vuetify.breakpoint.mdAndUp
                }"
              >
                <v-text-field
                  v-model="asset.purchaseDate"
                  name="purchaseDate"
                  mask="date"
                  :outlined="$vuetify.breakpoint.mdAndUp"
                  autocomplete="new-password"
                  label="Asset Purchase Date"
                  placeholder="Asset Purchase Date"
                />
              </v-col>
              <v-col
                cols="12"
                md="4"
                :class="{
                  'pl-2': $vuetify.breakpoint.mdAndUp
                }"
              >
                <v-text-field
                  v-model="asset.installDate"
                  name="installDate"
                  mask="date"
                  :outlined="$vuetify.breakpoint.mdAndUp"
                  autocomplete="new-password"
                  label="Asset Install Date"
                  placeholder="Asset Install Date"
                />
              </v-col>
              <v-col
                cols="12"
              >
                <v-text-field
                  v-model="asset.lineNo"
                  name="lineNo"
                  :outlined="$vuetify.breakpoint.mdAndUp"
                  autocomplete="new-password"
                  label="Line Notes"
                  placeholder="Line Notes"
                />
              </v-col>
              <v-col
                cols="12"
              >
                <v-textarea
                  v-model="asset.notes"
                  name="notes"
                  :outlined="$vuetify.breakpoint.mdAndUp"
                  autocomplete="new-password"
                  label="Asset Notes"
                  placeholder="Asset Notes"
                />
              </v-col>
            </v-row>
          </v-card-text>
          <v-divider />
          <v-card-text>
            <v-row>
              <v-col
                cols="12"
                class="pb-3"
              >
                <span
                  class="title"
                >
                  PM Information
                </span>
              </v-col>
              <v-col
                cols="12"
                sm="6"
                :class="{
                  'pl-2': $vuetify.breakpoint.smAndUp
                }"
              >
                <v-select
                  v-model="assetDepartment"
                  :items="departmentsPM"
                  item-text="text"
                  item-value="value"
                  :error-messages="departmentErrors"
                  autocomplete="new-password"
                  name="department"
                  :outlined="$vuetify.breakpoint.mdAndUp"
                  label="PM Department"
                  placeholder="PM Department"
                />
              </v-col>
            </v-row>
          </v-card-text>
          <v-card-text
            v-for="(pm, index) in asset.pms"
            :key="index"
          >
            <v-card
              outlined
            >
              <v-card-text>
                <v-row>
                  <!-- Template -->
                  <v-col
                    cols="12"
                  >
                    <v-autocomplete
                      v-model="pm.template"
                      :items="templates"
                      item-text="task"
                      item-value="id"
                      :outlined="$vuetify.breakpoint.mdAndUp"
                      autocomplete="new-password"
                      label="Assign PM Template"
                      placeholder="Assign PM Template"
                      @change="getTemplate(pm)"
                    />
                  </v-col>
                  <!-- task -->
                  <v-col>
                    <v-text-field
                      v-model="pm.task"
                      label="PM Name"
                      placeholder="PM Name"
                      autocomplete="new-password"
                      :outlined="$vuetify.breakpoint.mdAndUp"
                    />
                  </v-col>
                  <!-- freq -->
                  <v-col
                    cols="12"
                    sm="6"
                    :class="{
                      'pr-2': $vuetify.breakpoint.smAndUp
                    }"
                  >
                    <v-dialog
                      v-model="pm.dateDialog"
                      width="290px"
                    >
                      <template
                        v-slot:activator="{ on }"
                      >
                        <v-text-field
                          v-model="pm.start"
                          label="PM Start Date"
                          placeholder="PM Start Date"
                          autocomplete="new-password"
                          :outlined="$vuetify.breakpoint.mdAndUp"
                          readonly
                          v-on="on"
                        />
                      </template>
                      <v-date-picker
                        v-model="pm.start"
                        name="pmStartDate"
                        color="primary"
                        class="elevation-0"
                        @input="closeDate(pm)"
                      />
                    </v-dialog>
                  </v-col>
                  <v-col
                    cols="12"
                    sm="6"
                    :class="{
                      'pr-2': $vuetify.breakpoint.smAndUp
                    }"
                  >
                    <v-select
                      v-model="pm.freq"
                      :items="pmFreqList"
                      item-text="text"
                      item-value="value"
                      autocomplete="new-password"
                      :outlined="$vuetify.breakpoint.mdAndUp"
                      label="PM Frequency"
                      placeholder="PM Frequency"
                    />
                  </v-col>
                  <!-- assignedTo -->
                  <v-col
                    cols="12"
                    sm="6"
                    :class="{
                      'pr-2': $vuetify.breakpoint.smAndUp
                    }"
                  >
                    <v-select
                      v-model="pm.assignedTo"
                      :items="workers"
                      item-text="text"
                      item-value="value"
                      name="assignedTo"
                      autocomplete="new-password"
                      :outlined="$vuetify.breakpoint.mdAndUp"
                      label="Assigned To"
                      placeholder="Assigned To"
                    />
                  </v-col>
                  <!-- steps -->
                  <v-col
                    cols="12"
                    class="caption"
                    :class="{
                      'px-2': $vuetify.breakpoint.smAndUp
                    }"
                  >
                    Add, Edit, or Delete Custom Steps for {{ pm.task }}
                  </v-col>
                  <v-col
                    cols="12"
                    class="pt-3"
                  >
                    <div
                      v-if="pm.steps && pm.steps.length > 0"
                    >
                      <v-row
                        v-for="(field, key) in pm.steps"
                        :key="key"
                      >
                        <v-col
                          cols="12"
                        >
                          <v-text-field
                            v-if="field.type === 'textField'"
                            :name="field.name"
                            :label="field.label"
                            :placeholder="field.label"
                            :outlined="$vuetify.breakpoint.mdAndUp"
                            autocomplete="new-password"
                            append-icon="mdi-pencil"
                            readonly
                            @click:append="showEdit(field)"
                          />
                          <v-textarea
                            v-else-if="field.type === 'textArea'"
                            :name="field.name"
                            :label="field.label"
                            :placeholder="field.label"
                            :outlined="$vuetify.breakpoint.mdAndUp"
                            autocomplete="new-password"
                            append-icon="mdi-pencil"
                            readonly
                            @click:append="showEdit(field)"
                          />
                          <div
                            v-else-if="field.type === 'checkbox'"
                          >
                            <span
                              class="pb-2 subheading grey--text text--lighten-1"
                            >
                              {{ field.label }}
                            </span>
                            <v-icon
                              @click="showEdit(field)"
                            >
                              mdi-pencil
                            </v-icon>
                            <div
                              v-for="(value, i) in field.options"
                              :key="i"
                            >
                              <v-checkbox
                                color="primary"
                                :name="field.name"
                                :label="value.label"
                                :input-value="value.input"
                                readonly
                              />
                            </div>
                          </div>
                          <div
                            v-else-if="field.type === 'radio'"
                          >
                            <span
                              class="pb-2 subheading grey--text text--lighten-1"
                            >
                              {{ field.label }}
                            </span>
                            <v-icon
                              @click="showEdit(field)"
                            >
                              mdi-pencil
                            </v-icon>
                            <v-radio-group
                              :name="field.name"
                            >
                              <div
                                v-for="(value, i) in field.options"
                                :key="i"
                              >
                                <v-radio
                                  color="primary"
                                  :label="value.label"
                                  :input-value="value.input"
                                  :name="field.name"
                                  disabled
                                />
                              </div>
                            </v-radio-group>
                          </div>
                          <v-dialog
                            v-model="field.show"
                            persistent
                            transition="dialog-bottom-transition"
                          >
                            <v-card>
                              <v-card-title
                                primary-title
                              >
                                PM Step
                              </v-card-title>
                              <v-divider />
                              <v-card-text
                                class="py-4"
                              >
                                <v-row>
                                  <v-col
                                    cols="12"
                                    sm="12"
                                    md="4"
                                    :class="{
                                      'py-2 pr-2': $vuetify.breakpoint.mdAndUp,
                                      'py-2': $vuetify.breakpoint.smAndDown
                                    }"
                                  >
                                    <v-select
                                      v-model="field.type"
                                      :items="types"
                                      label="Field Type"
                                      placeholder="Field Type"
                                      :outlined="$vuetify.breakpoint.mdAndUp"
                                      autocomplete="new-password"
                                      persistent-hint
                                      hint="The input type for the field."
                                      @input="changeType"
                                    />
                                  </v-col>
                                  <v-col
                                    cols="12"
                                    sm="12"
                                    md="4"
                                    :class="{
                                      'py-2 pl-2 pr-2': $vuetify.breakpoint.mdAndUp,
                                      'py-2': $vuetify.breakpoint.smAndDown
                                    }"
                                  >
                                    <v-text-field
                                      v-model="field.name"
                                      label="Field Name"
                                      placeholder="Field Name"
                                      autocomplete="new-password"
                                      persistent-hint
                                      :outlined="$vuetify.breakpoint.mdAndUp"
                                      hint="Name of the field to be used in the database."
                                    />
                                  </v-col>
                                  <v-col
                                    cols="12"
                                    sm="12"
                                    md="4"
                                    :class="{
                                      'py-2 pl-2': $vuetify.breakpoint.mdAndUp,
                                      'py-2': $vuetify.breakpoint.smAndDown
                                    }"
                                  >
                                    <v-text-field
                                      v-model="field.label"
                                      label="Field Label"
                                      placeholder="Field Label"
                                      autocomplete="new-password"
                                      persistent-hint
                                      :outlined="$vuetify.breakpoint.mdAndUp"
                                      hint="The visible name that goes above the field."
                                    />
                                  </v-col>
                                  <v-col
                                    v-if="field.type === 'checkbox' || field.type === 'radio'"
                                  >
                                    <v-row
                                      v-for="(value, i) in field.options"
                                      :key="i"
                                    >
                                      <v-col
                                        cols="12"
                                        sm="12"
                                        md="5"
                                        :class="{
                                          'py-2 pr-2': $vuetify.breakpoint.mdAndUp,
                                          'py-2': $vuetify.breakpoint.smAndDown
                                        }"
                                      >
                                        <v-text-field
                                          v-model="value.label"
                                          label="Input Label"
                                          placeholder="Input Label"
                                          autocomplete="new-password"
                                          persistent-hint
                                          :outlined="$vuetify.breakpoint.mdAndUp"
                                          hint="The visible label for this option."
                                        />
                                      </v-col>
                                      <v-col
                                        cols="12"
                                        sm="12"
                                        md="5"
                                        :class="{
                                          'py-2 pl-2': $vuetify.breakpoint.mdAndUp,
                                          'py-2': $vuetify.breakpoint.smAndDown
                                        }"
                                      >
                                        <v-text-field
                                          v-model="value.input"
                                          label="Input Value"
                                          placeholder="Input Value"
                                          autocomplete="new-password"
                                          persistent-hint
                                          :outlined="$vuetify.breakpoint.mdAndUp"
                                          hint="The value this option will have if clicked."
                                        />
                                      </v-col>
                                      <v-col
                                        cols="12"
                                        sm="12"
                                        md="2"
                                        :class="{
                                          'py-2 pl-2': $vuetify.breakpoint.mdAndUp,
                                          'py-2': $vuetify.breakpoint.smAndDown
                                        }"
                                      >
                                        <v-btn
                                          fab
                                          text
                                          color="error"
                                          @click="removeOption(field, i)"
                                        >
                                          <v-icon>
                                            mdi-close
                                          </v-icon>
                                        </v-btn>
                                      </v-col>
                                    </v-row>
                                    <v-row>
                                      <v-col
                                        cols="12"
                                        class="py-2"
                                      >
                                        <v-btn
                                          color="primary"
                                          depressed
                                          small
                                          class="ml-0"
                                          @click="addOption(field)"
                                        >
                                          <v-icon
                                            :size="15"
                                          >
                                            mdi-shape-square-plus
                                          </v-icon>
                                          &ensp;option
                                        </v-btn>
                                      </v-col>
                                    </v-row>
                                  </v-col>
                                </v-row>
                              </v-card-text>
                              <v-card-actions>
                                <v-btn
                                  color="error"
                                  text
                                  @click="deleteThis(pm, key)"
                                >
                                  Delete
                                </v-btn>
                                <v-spacer />
                                <div
                                  v-if="field.error"
                                >
                                  <v-icon
                                    class="error--text"
                                  >
                                    mdi-alert-circle
                                  </v-icon>
                                  <span
                                    class="error--text"
                                  >
                                    {{ field.warning }}
                                  </span>
                                </div>
                                &ensp;
                                <v-btn
                                  depressed
                                  color="primary"
                                  @click="stepSave(field)"
                                >
                                  Okay
                                </v-btn>
                              </v-card-actions>
                            </v-card>
                          </v-dialog>
                        </v-col>
                      </v-row>
                    </div>
                    <v-row
                      v-else
                    >
                      <v-col
                        cols="12"
                        class="caption"
                      >
                        No Steps Set
                      </v-col>
                    </v-row>
                    <v-row>
                      <v-col
                        cols="12"
                        class="caption"
                      >
                        Add Step
                        <v-btn
                          icon
                          color="primary"
                          @click="addStep(pm)"
                        >
                          <v-icon>
                            mdi-text-box-plus-outline
                          </v-icon>
                        </v-btn>
                      </v-col>
                    </v-row>
                    <v-row>
                      <v-col
                        :cols="12"
                      >
                        <v-textarea
                          v-model="pm.pmNotes"
                          :rows="4"
                          placeholder="PM Notes"
                          label="PM Notes"
                          outlined
                        />
                      </v-col>
                    </v-row>
                    <v-row>
                      <v-col
                        cols="12"
                        class="caption"
                      >
                        Remove PM
                        <v-btn
                          icon
                          color="error"
                          @click="removePM(index)"
                        >
                          <v-icon>
                            mdi-database-minus
                          </v-icon>
                        </v-btn>
                      </v-col>
                    </v-row>
                  </v-col>
                </v-row>
              </v-card-text>
            </v-card>
          </v-card-text>
          <v-card-text>
            <v-row>
              <v-col
                cols="12"
                class="caption"
              >
                Add PM
                <v-btn
                  icon
                  color="primary"
                  @click="addPm"
                >
                  <v-icon>
                    mdi-database-plus
                  </v-icon>
                </v-btn>
              </v-col>
            </v-row>
          </v-card-text>
          <v-divider
            class="mt-5"
          />
          <v-card-actions
            class="px-3 pb-3 pt-5"
          >
            <v-btn
              color="primary"
              depressed
              @click="save"
            >
              Save
            </v-btn>
            <v-btn
              color="secondary"
              text
              @click="resetDialog = true"
            >
              Reset
            </v-btn>
            <div
              class="flex-wrap-1"
            />
            <v-btn
              v-show="iAmClaims.admin"
              color="error"
              depressed
              text
              @click="deleteDialog = true"
            >
              Delete
            </v-btn>
          </v-card-actions>
        </v-card>
        <v-card
          v-if="assetReady"
          class="mt-5"
        >
          <v-card-title
            class="primary white--text"
          >
            PM History
          </v-card-title>
          <v-card-text
            v-if="pmHistory.length > 0"
            class="pt-5"
          >
            <v-row>
              <v-col
                v-for="(item, index) in pmHistory"
                :key="index"
                cols="12"
                sm="6"
                md="4"
                lg="3"
              >
                <v-card
                  outlined
                >
                  <v-card-text>
                    <b>
                      Created:
                    </b>
                    <span
                      v-if="item.createdDate"
                    >
                      {{ processDate(item.createdDate) }}
                    </span>
                    <br>
                    <b>
                      Assignee:
                    </b>
                    {{ item.assignedTo.displayName }}
                    <br>
                    <b>
                      Closed:
                    </b>
                    <span
                      v-if="item.closedDate"
                    >
                      {{ processDate(item.closedDate) }}
                    </span>
                  </v-card-text>
                  <v-card-actions>
                    <v-btn
                      block
                      text
                      color="info"
                      @click="$router.push(`/${baseUrl}/workorder/${item.id}`)"
                    >
                      View Ticket
                    </v-btn>
                  </v-card-actions>
                </v-card>
              </v-col>
            </v-row>
          </v-card-text>
          <v-card-text
            v-else
            class="pt-5"
          >
            No PM History for this asset
          </v-card-text>
        </v-card>
        <div
          v-else
          class="pa-5"
        >
          <v-progress-circular
            indeterminate
            color="info"
          />
        </div>
      </v-col>
    </v-row>
    <v-dialog
      v-model="saveLoading"
      hide-overlay
      :persistent="!saveMessage"
      width="300"
    >
      <v-card
        color="primary"
      >
        <div
          v-if="!saveMessage"
        >
          <v-card-text>
            Saving Changes
            <v-progress-linear
              indeterminate
              color="white"
              class="mb-0"
            />
          </v-card-text>
        </div>
        <div
          v-else
        >
          <v-card-title
            primary-title
            :color="saveMessage.color"
            class="title"
          >
            {{ saveMessage.title }}
          </v-card-title>
          <v-card-text>
            {{ saveMessage.text }}
          </v-card-text>
        </div>
      </v-card>
    </v-dialog>
    <v-dialog
      v-model="resetDialog"
      persistent
      width="300"
    >
      <v-card>
        <v-card-title
          primary-title
          class="title"
        >
          <v-icon
            color="error"
          >
            mdi-alert-circle
          </v-icon>
          &nbsp;CAUTION!
        </v-card-title>
        <v-card-text>
          Are you sure? Any changes you made without saving will be lost.
        </v-card-text>
        <v-card-actions>
          <v-btn
            color="secondary"
            text
            @click="reset"
          >
            Reset
          </v-btn>
          <div
            class="flex-grow-1"
          />
          <v-btn
            color="primary"
            text
            @click="resetDialog = false"
          >
            Cancel
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <v-dialog
      v-model="deleteDialog"
      persistent
      width="300"
    >
      <v-card>
        <v-card-title
          primary-title
          class="title"
        >
          <v-icon
            color="error"
          >
            mdi-alert-circle
          </v-icon>
          &nbsp;WARNING!
        </v-card-title>
        <v-card-text>
          Are you sure you want to delete this asset? All data related to this asset will be destroyed!
        </v-card-text>
        <v-card-actions>
          <v-btn
            color="error"
            text
            :loading="deleteLoading"
            @click="deleteAsset"
          >
            Delete
          </v-btn>
          <div
            class="flex-grow-1"
          />
          <v-btn
            color="primary"
            text
            @click="deleteDialog = false"
          >
            Cancel
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script>
import { validationMixin } from 'vuelidate'
import { required } from 'vuelidate/lib/validators'

export default {
  mixins: [validationMixin],
  validations: {
    newTag: { required },
    assetDepartment: { required }
  },
  data () {
    return {
      asset: {
        department: this.assetDepartment
      },
      assetDialog: false,
      assetReady: false,
      baseUrl: null,
      deleteDialog: false,
      deleteLoading: false,
      newTag: null,
      oldDepartment: null,
      pmFreqList: [
        {
          text: 'Daily',
          value: 'daily'
        },
        {
          text: 'Weekly',
          value: 'weekly'
        },
        {
          text: 'Every Two Weeks',
          value: 'biMonthly'
        },
        {
          text: 'Monthly',
          value: 'monthly'
        },
        {
          text: 'Quarterly',
          value: 'quarterly'
        },
        {
          text: 'Every Six Months',
          value: 'biAnnually'
        },
        {
          text: 'Annually',
          value: 'annually'
        },
        {
          text: 'Every Two Years',
          value: 'twoYears'
        },
        {
          text: 'Every Two and a Half Years',
          value: 'twoHalfYears'
        },
        {
          text: 'Every Three Years',
          value: 'threeYears'
        },
        {
          text: 'Every Four Years',
          value: 'fourYears'
        }
      ],
      pmHistory: [],
      pmModal: false,
      resetDialog: false,
      saveLoading: false,
      saveMessage: null,
      storageRef: this.$storage.ref().child('assets'),
      types: [
        'textField',
        'textArea',
        'checkbox',
        'radio'
      ],
      users: []
    }
  },
  computed: {
    assetDepartment: {
      get () {
        return this.$store.state.assetDepartment
      },
      set (value) {
        this.$store
          .dispatch('updateAssetDepartment', value)
          .then(() => this.$store
            .dispatch('getModels')
          )
      }
    },
    buildings () { return this.$store.state.buildings },
    iAmClaims () { return this.$store.state.claims },
    departmentErrors () {
      const errors = []
      if (!this.$v.assetDepartment.$dirty) { return errors }
      !this.$v.assetDepartment.required && errors.push('Asset PM Department is required.')
      return errors
    },
    departments () { return this.$store.state.departments },
    departmentsPM () { return this.$store.state.departmentsPM },
    manufacturers () { return this.$store.state.manufacturers },
    models () { return this.$store.state.models },
    tagErrors () {
      const errors = []
      if (!this.$v.newTag.$dirty) { return errors }
      !this.$v.newTag.required && errors.push('Asset Tag is required.')
      return errors
    },
    templates () { return this.$store.state.templates },
    workers () { return this.$store.state.assetWorkers }
  },
  beforeMount () {
    this.getUsersList()
    this.getWorkers()
  },
  mounted () {
    this.getTemplates()
    this.setBaseUrl()
    this.$nextTick(() => this.getAsset())
    this.$nextTick(() => this.getPmHistory())
  },
  methods: {
    addOption (field) {
      if (!field.options || !Array.isArray(field.options)) { field.options = [] }
      field.options
        .push({
          label: 'Option Label',
          input: 'Option Value'
        })
      this.$forceUpdate()
    },
    addPm () {
      if (!this.asset.pms || !Array.isArray(this.asset.pms)) { this.asset.pms = [] }
      this.asset.pms
        .push({})
      this.$forceUpdate()
    },
    addStep (pm) {
      // Push initial value for new custom field and force Vue to update
      if (!pm.steps || !Array.isArray(pm.steps)) {
        pm.steps = []
      }
      pm.steps
        .push({
          name: 'newStep',
          label: 'New Step',
          type: 'textField'
        })
      this.$forceUpdate()
    },
    changeType (value) {
      this.$forceUpdate()
    },
    closeDate (pm) {
      pm.dateDialog = false
      this.$forceUpdate()
    },
    closeMessage () {
      this.saveMessage = null
      this.saveLoading = false
    },
    // This will only work for admin level users
    deleteAsset () {
      this.deleteLoading = true
      this.$store
        .dispatch('deleteAsset', this.asset)
        .then(() => {
          this.deleteLoading = false
          this.$router.go(-1)
        })
        .catch((error) => {
          this.deleteLoading = false
          this.$store
            .dispatch('updateLocalErrors', error)
        })
    },
    deleteThis (pm, key) {
      pm.steps[key].show = false
      pm.steps
        .splice(key, 1)
      this.$forceUpdate()
    },
    getAsset () {
      if (this.$route.params.id === 'new') {
        this.asset.tag = ['New Asset']
        this.assetReady = true
        setTimeout(() => {
          this.$store
            .dispatch('getModels', this.assetDepartment)
        }, 1250)
      } else {
        this.$store
          .dispatch('getSingleAsset', { assetId: this.$route.params.id })
          .then((response) => {
            Object
              .keys(response)
              .forEach((k) => { this.asset[k] = response[k] })
            this.oldDepartment = response.department
            this.assetReady = true
            this.$store
              .dispatch('updateAssetDepartment', response.department)
              .then(() => this.$store
                .dispatch('getModels')
              )
              .catch((error) => {
                this.$store
                  .dispatch('updateLocalErrors', error)
              })
          })
          .catch((error) => {
            this.$store
              .dispatch('updateLocalErrors', error)
          })
      }
    },
    getPmHistory () {
      this.$db
        .collection('workOrders')
        .where('workOrderType', '==', 'PM')
        .where('assetId', '==', this.$route.params.id)
        .get()
        .then((querySnapshot) => {
          this.pmHistory = []
          querySnapshot
            .forEach((doc) => {
              const order = doc.data()
              order.id = doc.id
              this.pmHistory
                .push(order)
            })
          console
            .log(this.pmHistory)
        })
        .catch((error) => {
          this.$store
            .dispatch('updateLocalErrors', error)
        })
    },
    getTemplate (pm) {
      this.$db
        .collection('templates')
        .doc(pm.template)
        .get()
        .then((doc) => {
          Object
            .keys(doc.data())
            .forEach((k) => {
              pm[k] = doc.data()[k]
            })
          pm.template = doc.id
          this.$forceUpdate()
        })
        .catch((error) => {
          this.$store
            .dispatch('updateLocalErrors', error)
        })
    },
    getTemplates () {
      if (!this.$store.state.assetDepartment) {
        return setTimeout(() => { this.getTemplates() }, 150)
      }
      this.$store
        .dispatch('getTemplates')
        .catch((error) => {
          this.$store
            .dispatch('updateLocalErrors', error)
        })
    },
    getUsersList () {
      if (!this.$firebase.auth().currentUser) {
        return setTimeout(() => { this.getUsersList() }, 150)
      } else {
        this.$store
          .dispatch('getUsersList', this.$firebase.auth().currentUser.uid)
          .then((response) => { this.users = response })
          .catch((error) => {
            this.$store
              .dispatch('updateLocalErrors', error)
          })
      }
    },
    getWorkers () {
      if (!this.$firebase.auth().currentUser) {
        return setTimeout(() => { this.getWorkers() }, 150)
      } else if (this.$store.state.assetWorkers.length === 0) {
        this.$store
          .dispatch('getAssetWorkers', this.$firebase.auth().currentUser.uid)
          .catch((error) => {
            this.$store
              .dispatch('updateLocalErrors', error)
          })
      }
    },
    processDate (date, type) {
      if (typeof date === 'object' && type === 'time') {
        return this.$moment(date.toDate()).format('hh:mm:ss A')
      } else if (typeof date === 'object') {
        return this.$moment(date.toDate()).format('MM/DD/YYYY')
      } else {
        return date
      }
    },
    reset () {
      this.getAsset()
      this.resetDialog = false
    },
    removeOption (field, i) {
      field.options
        .splice(i, 1)
      this.$forceUpdate()
    },
    removePM (index) {
      this.asset.pms
        .splice(index, 1)
      this.$forceUpdate()
    },
    save () {
      if (this.asset.tag && Array.isArray(this.asset.tag) && this.asset.tag[0] !== 'New Asset') {
        this.saveLoading = true
        this.asset.editedBy = this.$firebase.auth().currentUser.displayName
        if (this.asset.pms && Array.isArray(this.asset.pms) && this.asset.pms.length > 0) {
          if (this.asset.pms.steps && Array.isArray(this.asset.pms.steps) && this.asset.pms.steps.length > 0) {
            const arr = this.asset.pms.steps
            let i = arr.length
            while (i--) {
              if (!arr[i].type) { arr.splice(i, 1) }
            }
            this.asset.pms.steps = arr
          }
        } else {
          this.asset.pms = []
        }
        const templateIndex = []
        if (this.asset.pms.length > 0) {
          for (let i = 0; i < this.asset.pms.length; i++) {
            if (this.asset.pms[i].template) {
              templateIndex
                .push(this.asset.pms[i].template)
            }
          }
        }
        const descIndex = templateIndex.filter((elem, index, self) => { return index === self.indexOf(elem) })
        this.asset.templateIndex = descIndex
        this.asset.department = this.assetDepartment
        this.asset.active = (typeof this.asset.active !== 'undefined') ? this.asset.active : true
        this.asset.addedBy = this.asset.addedBy || this.$firebase.auth().currentUser.displayName
        this.asset.addedDate = this.asset.addedDate || this.$firebase.firestore.Timestamp.now()
        this.asset.addedTime = this.asset.addedTime || this.$firebase.firestore.Timestamp.now()
        this.asset.assetId = this.$route.params.id
        this.asset.editedBy = this.$firebase.auth().currentUser.displayName
        this.asset.editedDate = this.$firebase.firestore.Timestamp.now()
        this.asset.editedTime = this.$firebase.firestore.Timestamp.now()
        this.asset.oldDepartment = (this.oldDepartment !== this.asset.department) ? this.oldDepartment : null
        if (typeof this.asset.tag === 'string') {
          const arr = [this.asset.tag]
          this.asset.tag = arr
        }
        this.$store
          .dispatch('saveAsset', this.asset)
          .then((response) => {
            if (this.$route.params.id === 'new') {
              this.$router
                .replace(response)
              this.$route.params.id = response
              this.asset.assetId = response
              this.asset.addedBy = this.asset.editedBy
              this.asset.addedDate = this.asset.editedDate
              this.asset.addedTime = this.asset.editedTime
            }
            this.saveMessage = {
              color: 'white--text',
              title: 'Saved!',
              text: 'Asset has been saved.'
            }
            setTimeout(() => {
              if (this.saveLoading) { this.saveLoading = false }
              this.saveMessage = null
            }, 500)
            this.$router
              .go(-1)
          })
          .catch((error) => {
            this.$store
              .dispatch('updateLocalErrors', error)
            setTimeout(() => {
              if (this.saveLoading) { this.saveLoading = false }
              this.saveMessage = null
            }, 3000)
          })
      } else {
        alert('Please click the change tag button above before saving.')
      }
    },
    saveNewTag () {
      this.$v.$touch()
      if (!this.$v.$invalid) {
        this.asset.tag
          .unshift(this.newTag)
        this.newTag = null
        this.assetDialog = false
      }
    },
    setBaseUrl () {
      if (!this.$firebase.auth().currentUser) { return setTimeout(() => { this.setBaseUrl() }, 250) }
      this.baseUrl = this.$firebase.auth().currentUser.displayName.replace(/ /g, '')
    },
    showEdit (field) {
      field.show = true
      this.$forceUpdate()
    },
    stepSave (field) {
      if (!field.type || field.type === '') {
        field.error = true
        field.warning = `You must select a Field Type!`
      } else if (!field.name || field.name === '') {
        field.error = true
        field.warning = `You must enter a Field Name!`
      } else if (!field.label || field.label === '') {
        field.error = true
        field.warning = `You must enter a Field Label!`
      } else if (field.type === 'checkbox' || field.type === 'radio') {
        if (!field.options || Object.keys(field.options).length === 0) {
          field.error = true
          field.warning = `You must have at least one option when using a ${field.type} input!`
        } else {
          field.error = false
          field.warning = ''
        }
      } else {
        field.error = false
        field.warning = ''
      }
      if (!field.error) { field.show = false }
      this.$forceUpdate()
    }
  }
}
</script>
