<template>
  <v-container
    fluid
    :class="{
      'px-3 py-0': $vuetify.breakpoint.mdAndUp,
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
          v-if="workOrder && typeof workOrder === 'object' && Object.keys(workOrder).length > 0"
          outlined
          class="mb-5"
        >
          <div
            id="ticket"
          >
            <v-card-title>
              <span
                class="display-1"
                :style="(iAmClaims.admin) ? 'cursor:pointer' : ''"
                @click="(iAmClaims.admin) ? subjectModal = true : subjectModal = false"
              >
                {{ workOrder.subject }}
              </span>
              &emsp;
              <span
                v-if="!iAmClaims.staff && workOrder.priority === 'Urgent' && workOrder.status !== 'Closed'"
                class="error--text flashing"
              >
                URGENT
                <v-icon
                  class="error--text mb-2"
                >
                  mdi-alert-circle
                </v-icon>
                &emsp;
              </span>
              <div
                v-if="workOrder && workOrder.quickNote"
              >
                <v-chip
                  color="primary"
                  @click="quickNoteModal = true"
                >
                  <v-avatar
                    left
                  >
                    <v-icon
                      :size="20"
                    >
                      mdi-bell
                    </v-icon>
                  </v-avatar>
                  {{ workOrder.quickNote }}
                </v-chip>
              </div>
              <v-dialog
                v-model="subjectModal"
                max-width="500px"
                persistent
                transition="dialog-transition"
              >
                <v-card>
                  <v-card-title
                    primary-title
                    class="subtitle-1 primary white--text"
                  >
                    Change Subject
                  </v-card-title>
                  <v-card-text
                    class="pt-5"
                  >
                    <v-select
                      v-if="workOrder.department === 'it'"
                      v-model="workOrder.subject"
                      :items="[
                        'Affinity',
                        'Audio/Video Equipment',
                        'Computer/Tablet',
                        'Demographic Change Form',
                        'DocuTap',
                        'ePHI Form',
                        'Epic/SoftLab',
                        'Epic Training Request',
                        'Employee Change Form',
                        'Hardware/Workflow Request',
                        'Laptop Request Form',
                        'MM Hayes/Cash Registers/Vending Machines',
                        'New Hire Form',
                        'Phones',
                        'Point Click Care',
                        'Printing',
                        'Separation of Service Form',
                        'Signage',
                        'Social Media Request',
                        'TV/Cable Service',
                        'Websites/Intranet',
                        'Windows Password Reset',
                        'Work Order System',
                        'Other'
                      ]"
                      :outlined="$vuetify.breakpoint.mdAndUp"
                      label="Change Subject"
                      placeholder="Change Subject"
                    />
                    <v-text-field
                      v-else
                      v-model="workOrder.subject"
                      name="subject"
                      :outlined="$vuetify.breakpoint.mdAndUp"
                      label="Change Subject"
                      placeholder="Change Subject"
                    />
                  </v-card-text>
                  <v-card-actions>
                    <v-btn
                      text
                      color="secondary"
                      @click="subjectModal = false"
                    >
                      cancel
                    </v-btn>
                    <v-spacer />
                    <v-btn
                      depressed
                      color="primary"
                      :loading="subjectLoading"
                      @click="changeSubject"
                    >
                      save
                    </v-btn>
                  </v-card-actions>
                </v-card>
              </v-dialog>
              <v-spacer />
              <v-menu
                v-if="iAmClaims.admin"
                left
                bottom
              >
                <template
                  v-slot:activator="{ on }"
                >
                  <v-btn
                    icon
                    color="primary"
                    :loading="priorityLoading"
                    v-on="on"
                  >
                    <v-icon>
                      mdi-alert-circle
                    </v-icon>
                  </v-btn>
                </template>
                <v-list>
                  <v-list-item>
                    <v-list-item-content
                      style="cursor:pointer"
                      @click="setPriority('Normal')"
                    >
                      Normal
                    </v-list-item-content>
                  </v-list-item>
                  <v-list-item>
                    <v-list-item-content
                      style="cursor:pointer"
                      @click="setPriority('Urgent')"
                    >
                      Urgent
                    </v-list-item-content>
                  </v-list-item>
                </v-list>
              </v-menu>
              <v-btn
                icon
                color="primary"
                @click="print"
              >
                <v-icon>
                  mdi-printer
                </v-icon>
              </v-btn>
              <v-btn
                v-if="!iAmClaims.staff"
                icon
                color="primary"
                @click="quickNoteModal = true"
              >
                <v-icon>
                  mdi-plus
                </v-icon>
              </v-btn>
              <v-btn
                v-if="previousPage"
                icon
                color="primary"
                nuxt
                :to="previousPage"
              >
                <v-icon>
                  mdi-chevron-left
                </v-icon>
              </v-btn>
              <v-btn
                v-if="nextPage"
                icon
                color="primary"
                nuxt
                :to="nextPage"
              >
                <v-icon>
                  mdi-chevron-right
                </v-icon>
              </v-btn>
              <v-dialog
                v-model="quickNoteModal"
                max-width="500px"
                persistent
                transition="dialog-transition"
              >
                <v-card>
                  <v-card-title
                    primary-title
                    class="subtitle-1 primary white--text"
                  >
                    Add Quick Note
                  </v-card-title>
                  <v-card-text
                    class="pt-5"
                  >
                    <v-text-field
                      v-model="workOrder.quickNote"
                      name="quickNote"
                      :outlined="$vuetify.breakpoint.mdAndUp"
                      label="Quick Note"
                      placeholder="Quick Note"
                    />
                  </v-card-text>
                  <v-card-actions>
                    <v-btn
                      depressed
                      color="secondary"
                      @click="quickNoteModal = false"
                    >
                      Cancel
                    </v-btn>
                    <v-spacer />
                    <v-btn
                      depressed
                      color="primary"
                      :loading="quickNoteLoading"
                      @click="saveQuickNote"
                    >
                      Save
                    </v-btn>
                  </v-card-actions>
                </v-card>
              </v-dialog>
            </v-card-title>
            <v-divider />
            <v-card-text
              class="pb-1"
            >
              <v-container
                fluid
                class="pa-0"
              >
                <v-row>
                  <v-col
                    v-if="workOrder.ticketNumber"
                    cols="12"
                    sm="6"
                    class="px-2 pb-3"
                  >
                    <span
                      class="font-weight-bold"
                    >
                      Work Order Number:&nbsp;
                    </span>
                    {{ workOrder.ticketNumber }}
                  </v-col>
                  <v-col
                    cols="12"
                    sm="6"
                    class="px-2 pb-3"
                  >
                    <span
                      class="font-weight-bold"
                    >
                      Status:&nbsp;
                    </span>
                    <span
                      v-if="workOrder.status === 'Past Due'"
                      class="error--text"
                    >
                      <v-icon
                        class="error--text"
                      >
                        mdi-clock-alert-outline
                      </v-icon>
                      {{ workOrder.status }}
                    </span>
                    <span
                      v-else-if="workOrder.status === 'Closed'"
                    >
                      {{ workOrder.status }} {{ workOrder.closedDate }}
                    </span>
                    <span
                      v-else
                    >
                      {{ workOrder.status }}
                    </span>
                  </v-col>
                  <v-col
                    cols="12"
                    sm="6"
                    class="px-2 pb-3"
                  >
                    <span
                      class="font-weight-bold"
                    >
                      Priority:&nbsp;
                    </span>
                    {{ workOrder.priority }}
                  </v-col>
                  <v-col
                    cols="12"
                    sm="6"
                    class="px-2 pb-3"
                  >
                    <span
                      class="font-weight-bold"
                    >
                      User:&nbsp;
                    </span>
                    {{ workOrder.user }}
                  </v-col>
                  <v-col
                    cols="12"
                    sm="6"
                    class="px-2 pb-3"
                  >
                    <span
                      class="font-weight-bold"
                    >
                      Email:&nbsp;
                    </span>
                    {{ workOrder.from }}
                  </v-col>
                  <v-col
                    cols="12"
                    sm="6"
                    class="px-2 pb-3"
                  >
                    <span
                      class="font-weight-bold"
                    >
                      Created:&nbsp;
                    </span>
                    {{ workOrder.createdDate }}
                  </v-col>
                  <v-col
                    cols="12"
                    sm="6"
                    class="px-2 pb-3"
                  >
                    <span
                      class="font-weight-bold"
                    >
                      Last Updated:&nbsp;
                    </span>
                    {{ workOrder.lastUpdated }}
                  </v-col>
                  <v-col
                    v-if="lastReopen"
                    cols="12"
                    sm="6"
                    class="px-2 pb-3"
                  >
                    <span
                      class="font-weight-bold"
                    >
                      Reopened:&nbsp;
                    </span>
                    {{ processDate(lastReopen) }}
                  </v-col>
                  <v-col
                    cols="12"
                    sm="6"
                    class="px-2 pb-3"
                  >
                    <span
                      class="font-weight-bold"
                    >
                      Phone:&nbsp;
                    </span>
                    {{ workOrder.phone }}
                  </v-col>
                </v-row>
                <v-row
                  v-if="workOrder.options && typeof workOrder.options === 'object' && Object.keys(workOrder.options).length > 0"
                >
                  <v-col
                    v-for="(item, index) in workOrder.options"
                    :key="index"
                    cols="12"
                    sm="6"
                    class="px-2 pb-3"
                  >
                    <span
                      class="font-weight-bold"
                    >
                      {{ index }}:&nbsp;
                    </span>
                    {{ item }}
                  </v-col>
                </v-row>
                <v-row>
                  <v-col
                    v-if="workOrder.filesUploaded && Array.isArray(workOrder.filesUploaded) && workOrder.filesUploaded.length > 0"
                    cols="12"
                    class="px-2 pb-3"
                  >
                    <span
                      class="font-weight-bold"
                    >
                      Files:
                    </span>
                    <br>
                    <div
                      v-for="(item, index) in workOrder.filesUploaded"
                      :key="index"
                    >
                      <p
                        class="mb-0 pb-1"
                      >
                        <a
                          :href="item.url"
                          target="_blank"
                        >
                          {{ item.name }}
                        </a>
                      </p>
                    </div>
                  </v-col>
                  <v-col
                    cols="12"
                  />
                  <v-col
                    cols="12"
                    sm="6"
                    class="px-2 pb-3"
                  >
                    <v-select
                      v-if="!iAmClaims.staff"
                      v-model="workOrder.building"
                      :items="buildings"
                      :outlined="$vuetify.breakpoint.mdAndUp"
                      :append-icon="buildingIcon"
                      label="Building"
                      placeholder="Building"
                      hide-details
                      @input="changeBuilding"
                    />
                    <div
                      v-else
                    >
                      <span
                        class="font-weight-bold"
                      >
                        Building:&nbsp;
                      </span>
                      {{ building }}
                    </div>
                  </v-col>
                  <v-col
                    cols="12"
                    sm="6"
                    class="px-2 pb-3"
                  >
                    <v-select
                      v-if="!iAmClaims.staff"
                      v-model="workOrder.staffDepartment"
                      :items="departmentsStaff"
                      :outlined="$vuetify.breakpoint.mdAndUp"
                      :append-icon="departmentsStaffIcon"
                      label="Issue Department"
                      placeholder="Issue Department"
                      hide-details
                      @input="changeDepartmentsStaff"
                    />
                    <div
                      v-else
                    >
                      <span
                        class="font-weight-bold"
                      >
                        Issue Department:&nbsp;
                      </span>
                      {{ staffDepartment }}
                    </div>
                  </v-col>
                  <v-col
                    cols="12"
                    sm="6"
                    class="px-2 pb-3"
                  >
                    <v-select
                      v-if="!iAmClaims.staff"
                      v-model="workOrder.department"
                      :items="departments"
                      :outlined="$vuetify.breakpoint.mdAndUp"
                      :append-icon="departmentIcon"
                      label="Service Department"
                      placeholder="Service Department"
                      hide-details
                      @input="changeDepartment"
                    />
                    <div
                      v-else
                    >
                      <span
                        class="font-weight-bold"
                      >
                        Service Department:&nbsp;
                      </span>
                      {{ department }}
                    </div>
                  </v-col>
                  <v-col
                    cols="12"
                    sm="6"
                    class="px-2 pb-3"
                  >
                    <div
                      v-if="!iAmClaims.staff"
                      class="d-flex"
                      style="align-items:center"
                    >
                      <v-select
                        v-model="workOrder.assignedTo"
                        :items="workers"
                        :outlined="$vuetify.breakpoint.mdAndUp"
                        :append-icon="workerIcon"
                        label="Assigned To"
                        placeholder="Assigned To"
                        hide-details
                        class="mr-2"
                      />
                      <v-btn
                        id="assignButton"
                        color="primary"
                        depressed
                        @click="assign(workOrder.assignedTo)"
                      >
                        assign
                      </v-btn>
                    </div>
                    <div
                      v-else
                    >
                      <span
                        class="font-weight-bold"
                      >
                        Assigned To:&nbsp;
                      </span>
                      {{ assignedTo }}
                    </div>
                  </v-col>
                </v-row>
              </v-container>
            </v-card-text>
            <v-divider />
            <v-card-text
              class="pb-1"
            >
              <v-container
                fluid
                class="pa-0"
              >
                <v-row>
                  <v-col
                    cols="12"
                    class="px-2 pb-3"
                  >
                    <span
                      class="font-weight-bold"
                    >
                      Description:
                    </span>
                    <br>
                    <span
                      v-html="workOrder.description"
                    />
                  </v-col>
                  <v-col
                    v-if="!isPM && workOrder.tag"
                    cols="12"
                    class="px-2 pb-3"
                  >
                    <span
                      class="font-weight-bold"
                    >
                      Asset Tag:
                    </span>
                    <br>
                    {{ workOrder.tag }}
                  </v-col>
                </v-row>
              </v-container>
            </v-card-text>
            <v-divider
              v-show="isPM && workOrder && workOrder.steps && workOrder.steps.length > 0"
            />
            <v-card-text
              v-show="isPM"
              class="pb-1"
            >
              <v-container
                fluid
                class="pa-0"
              >
                <v-row>
                  <v-col
                    v-if="workOrder.tag && Array.isArray(workOrder.tag)"
                    cols="12"
                    sm="6"
                    class="px-2 pb-3"
                  >
                    <span
                      class="font-weight-bold"
                    >
                      Asset Tag:
                    </span>
                    {{ workOrder.tag[0] }}
                  </v-col>
                  <v-col
                    cols="12"
                    sm="6"
                    class="px-2 pb-3"
                  >
                    <span
                      class="font-weight-bold"
                    >
                      Manufacturer:
                    </span>
                    {{ workOrder.manufacturer }}
                  </v-col>
                  <v-col
                    cols="12"
                    sm="6"
                    class="px-2 pb-3"
                  >
                    <span
                      class="font-weight-bold"
                    >
                      Model:
                    </span>
                    {{ workOrder.modelNumber }}
                  </v-col>
                  <v-col
                    cols="12"
                    sm="6"
                    class="px-2 pb-3"
                  >
                    <span
                      class="font-weight-bold"
                    >
                      Serial:
                    </span>
                    {{ workOrder.serial }}
                  </v-col>
                  <v-col
                    cols="12"
                    sm="6"
                    class="px-2 pb-3"
                  >
                    <span
                      class="font-weight-bold"
                    >
                      Purchase Date:
                    </span>
                    {{ workOrder.purchaseDate }}
                  </v-col>
                  <v-col
                    cols="12"
                    sm="6"
                    class="px-2 pb-3"
                  >
                    <span
                      class="font-weight-bold"
                    >
                      Type:
                    </span>
                    {{ workOrder.assetType }}
                  </v-col>
                  <v-col
                    cols="12"
                    class="px-2 pb-3"
                  >
                    <span
                      class="font-weight-bold"
                    >
                      Asset Notes:
                    </span>
                    {{ workOrder.assetNotes }}
                  </v-col>
                  <v-col
                    cols="12"
                    class="px-2 pb-3"
                  >
                    <span
                      class="font-weight-bold"
                    >
                      PM Notes:
                    </span>
                    {{ workOrder.pmNotes }}
                  </v-col>
                </v-row>
              </v-container>
            </v-card-text>
            <v-divider
              v-show="isPM && workOrder && workOrder.steps && workOrder.steps.length > 0"
            />
            <v-card-text
              v-show="isPM && workOrder && workOrder.steps && workOrder.steps.length > 0"
            >
              <v-container
                fluid
                class="pa-0"
              >
                <v-row>
                  <v-col
                    cols="12"
                    class="px-2 pb-3"
                  >
                    <span
                      class="font-weight-bold"
                    >
                      PM Steps:
                    </span>
                  </v-col>
                  <v-col
                    v-for="(item, index) in workOrder.steps"
                    :key="index"
                    cols="12"
                    class="px-2 pb-3"
                  >
                    <div
                      v-if="item.type === 'textField'"
                    >
                      <span>
                        {{ item.label }}
                      </span>
                      <v-text-field
                        v-model="item.value"
                        :name="item.label"
                        :outlined="$vuetify.breakpoint.mdAndUp"
                        label="PM Step Input"
                        placeholder="PM Step Input"
                        class="pt-3"
                      />
                    </div>
                    <div
                      v-else-if="item.type === 'textArea'"
                    >
                      <span>
                        {{ item.label }}
                      </span>
                      <v-text-field
                        v-model="item.value"
                        :name="item.label"
                        :outlined="$vuetify.breakpoint.mdAndUp"
                        label="PM Step Input"
                        placeholder="PM Step Input"
                        class="pt-3"
                      />
                    </div>
                    <div
                      v-else-if="item.type === 'checkbox'"
                    >
                      <span>
                        {{ item.label }}
                      </span>
                      <div
                        v-for="(value, key) in item.options"
                        :key="key"
                        class="pb-3"
                      >
                        <v-checkbox
                          v-model="item.value"
                          color="primary"
                          :name="item.name"
                          :label="value.label"
                          :value="true"
                          hide-details
                          class="pb-0 mt-0"
                        />
                      </div>
                    </div>
                    <div
                      v-else-if="item.type === 'radio'"
                    >
                      <span>
                        {{ item.label }}
                      </span>
                      <v-radio-group
                        v-model="item.value"
                        :name="item.name"
                        class="mt-0"
                      >
                        <div
                          v-for="(value, key) in item.options"
                          :key="key"
                        >
                          <v-radio
                            color="primary"
                            :label="value.label"
                            :value="value.input"
                            :name="item.name"
                            class="pb-3"
                          />
                        </div>
                      </v-radio-group>
                    </div>
                  </v-col>
                </v-row>
              </v-container>
            </v-card-text>
          </div>
          <v-divider />
          <v-card-text
            v-if="workOrder.reassigned"
            class="pb-1"
          >
            <v-container
              fluid
              class="pa-0"
            >
              <v-row>
                <v-col
                  cols="12"
                  class="px-2 pb-3"
                >
                  <span
                    class="font-weight-bold"
                  >
                    Assignment History:
                  </span>
                </v-col>
                <v-col
                  v-for="(item, index) in workOrder.reassigned"
                  :key="index"
                  cols="12"
                  class="px-2 pb-3"
                >
                  <span
                    class="caption"
                  >
                    {{ processDate(item.date) }}
                  </span>
                  <br>
                  <span
                    v-if="item.old && item.old.displayName"
                  >
                    {{ item.old.displayName }}
                  </span>
                  <v-icon
                    :size="15"
                    class="pb-1"
                  >
                    mdi-arrow-right
                  </v-icon>
                  <span
                    v-if="item.new && item.new.displayName"
                  >
                    {{ item.new.displayName }}
                  </span>
                  &emsp;
                  <span
                    v-if="item.reAssignedBy && item.reAssignedBy.displayName"
                    class="overline"
                  >
                    <i>
                      Reassigned By {{ item.reAssignedBy.displayName }}
                    </i>
                  </span>
                </v-col>
              </v-row>
            </v-container>
          </v-card-text>
          <v-divider />
          <v-card-text
            v-if="!iAmClaims.staff"
            class="pb-1"
          >
            <v-container
              fluid
              class="pa-0"
            >
              <v-row>
                <v-col
                  cols="12"
                  class="px-2 pb-3"
                >
                  <span
                    class="font-weight-bold"
                  >
                    Internal Notes:
                  </span>
                </v-col>
                <v-col
                  v-for="(item, index) in workOrder.notes"
                  :key="index"
                  cols="12"
                  class="px-2 pb-3"
                >
                  {{ item }}
                </v-col>
                <v-col
                  cols="12"
                  class="px-2 pb-3"
                >
                  <v-text-field
                    v-model="internalNote"
                    name="addNote"
                    label="Add Internal Note"
                    placeholder="Add Internal Note"
                    :outlined="$vuetify.breakpoint.mdAndUp"
                  />
                  <v-btn
                    depressed
                    color="primary"
                    :loading="noteLoader"
                    @click="addNote"
                  >
                    Add Note
                  </v-btn>
                </v-col>
              </v-row>
            </v-container>
          </v-card-text>
          <v-divider />
          <v-card-text
            class="pb-1"
          >
            <v-container
              fluid
              class="pa-0"
            >
              <v-row>
                <v-col
                  cols="12"
                  class="px-2 pb-3"
                >
                  <span
                    class="font-weight-bold"
                  >
                    Conversation:
                  </span>
                </v-col>
                <v-col
                  cols="12"
                >
                  <Chat
                    :order-id="workOrder.id"
                    :owner-email="ownerEmail"
                    :owner-name="ownerName"
                    :worker-id="workerId"
                  />
                </v-col>
              </v-row>
            </v-container>
          </v-card-text>
          <v-divider
            v-show="!iAmClaims.staff"
          />
          <v-card-actions
            v-show="!iAmClaims.staff"
          >
            <v-btn
              color="secondary"
              depressed
              @click="$router.go(-1)"
            >
              Back
            </v-btn>
            <v-btn
              v-if="iAmClaims.admin"
              color="error"
              icon
              @click="delDialog = true"
            >
              <v-icon>
                mdi-delete-forever
              </v-icon>
            </v-btn>
            <v-spacer />
            <v-btn
              v-if="workOrder.workOrderType === 'PM'"
              depressed
              color="info"
              :loading="saveLoading"
              @click="save"
            >
              Save Changes to PM
            </v-btn>
            <v-btn
              v-if="workOrder.status === 'Open' || workOrder.status === 'Past Due'"
              depressed
              color="error"
              @click="close"
            >
              Complete Work Order
            </v-btn>
            <v-btn
              v-if="workOrder.status === 'Closed'"
              depressed
              color="info"
              :loading="reopenLoading"
              @click="open"
            >
              Reopen Work Order
            </v-btn>
          </v-card-actions>
        </v-card>
        <v-row
          v-else
        >
          <v-col
            cols="12"
            class="pa-5"
          >
            <v-progress-circular
              color="info"
              indeterminate
            />
          </v-col>
        </v-row>
      </v-col>
    </v-row>
    <v-dialog
      v-model="dialog"
      max-width="300px"
      transition="dialog-transition"
    >
      <v-card>
        <v-card-title>
          <v-icon
            color="primary"
          >
            mdi-email
          </v-icon>
          &ensp;Request Sent
        </v-card-title>
        <v-card-text>
          You work order status change request has been sent and will be reviewed. If approved, your work order will be reopend. Thank you.
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn
            depressed
            color="primary"
            @click="dialog = false"
          >
            Okay
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <v-dialog
      v-model="delDialog"
      max-width="300px"
      transition="dialog-transition"
    >
      <v-card>
        <v-card-title>
          <v-icon
            color="error"
          >
            mdi-alert-circle
          </v-icon>
          &nbsp;
          Delete???
        </v-card-title>
        <v-card-text>
          Are you sure you want to delete this work order?
        </v-card-text>
        <v-card-actions>
          <v-btn
            text
            color="secondary"
            @click="delDialog = false"
          >
            Forget about it
          </v-btn>
          <v-spacer />
          <v-btn
            v-if="iAmClaims.admin"
            depressed
            color="error"
            :loading="delLoading"
            @click="deleteIt"
          >
            Yes
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script>
export default {
  components: {
    Chat: () => import('@/components/Chat.vue')
  },
  data () {
    return {
      buildingIcon: '',
      delDialog: false,
      delLoading: false,
      departments: [
        {
          text: 'Biomedical',
          value: 'bioMed'
        },
        {
          text: 'Dietary',
          value: 'dietary'
        },
        {
          text: 'Environmental Services',
          value: 'evs'
        },
        {
          text: 'Facilities',
          value: 'facilities'
        },
        {
          text: 'Grounds',
          value: 'grounds'
        },
        {
          text: 'Information Technology',
          value: 'it'
        },
        {
          text: 'Transportation',
          value: 'transportation'
        }
      ],
      departmentIcon: '',
      departmentsStaffIcon: '',
      dialog: false,
      isPM: false,
      internalNote: null,
      lastReopen: null,
      noteLoader: false,
      ownerEmail: null,
      ownerName: null,
      priorityLoading: false,
      quickNoteLoading: false,
      quickNoteModal: false,
      reopenLoading: false,
      saveLoading: false,
      subjectLoading: false,
      subjectModal: false,
      unsubTicket: null,
      workerIcon: '',
      workerId: null,
      workOrder: null
    }
  },
  computed: {
    assignedTo () {
      if (this.workOrder.assignedTo && this.workOrder.assignedTo !== null && typeof this.workOrder.assignedTo === 'object') {
        return this.workOrder.assignedTo.displayName
      } else {
        return 'Not Assigned'
      }
    },
    buildings () { return this.$store.state.buildings },
    departmentsStaff () { return this.$store.state.departmentsStaff },
    iAmClaims () { return this.$store.state.claims },
    indexed () { return this.$store.state.woIndex },
    nextPage () {
      let next = null
      for (let i = 0; i < this.indexed.length; i++) {
        if (this.indexed[i] === this.$route.params.id) {
          next = (this.indexed[i + 1]) ? `/${this.user.displayName.replace(/\s+/g, '')}/workorder/${this.indexed[i + 1]}` : null
          break
        }
      }
      return next
    },
    previousPage () {
      let previous = null
      for (let i = 0; i < this.indexed.length; i++) {
        if (this.indexed[i] === this.$route.params.id) {
          previous = (this.indexed[i - 1]) ? `/${this.user.displayName.replace(/\s+/g, '')}/workorder/${this.indexed[i - 1]}` : null
          break
        }
      }
      return previous
    },
    user () { return this.$store.state.user },
    workers () { return this.$store.state.workers }
  },
  watch: {
    '$route.params.id' (val) {
      if (val) {
        this.getData()
        this.setRead()
      }
    }
  },
  mounted () {
    this.getData()
    this.setRead()
  },
  beforeDestroy () {
    if (this.unsubTicket) { this.unsubTicket() }
    this.$store.dispatch('unsubComments')
  },
  methods: {
    addNote () {
      if (!this.internalNote) { return alert('You did not add a note!') }
      this.noteLoader = true
      if (!this.workOrder.notes) { this.workOrder.notes = [] }
      this.workOrder.notes
        .push(this.internalNote)
      this.$db
        .collection('workOrders')
        .doc(this.$route.params.id)
        .update({
          notes: this.workOrder.notes
        })
        .then(() => {
          this.noteLoader = false
          this.internalNote = null
        })
        .catch((error) => {
          this.$store
            .dispatch('updateLocalErrors', error)
        })
    },
    assign (value) {
      if (!this.iAmClaims.staff && value) {
        this.$db
          .collection('workOrders')
          .doc(this.$route.params.id)
          .update({
            assignedTo: value,
            reAssignedBy: {
              displayName: this.$firebase.auth().currentUser.displayName,
              uid: this.$firebase.auth().currentUser.uid
            }
          })
          .then(() => this.confirmReassign())
          .catch((error) => {
            this.$store
              .dispatch('updateLocalErrors', error)
          })
      }
    },
    changeBuilding () {
      this.$db
        .collection('workOrders')
        .doc(this.$route.params.id)
        .update({ building: this.workOrder.building })
        .then(() => this.confirmBuilding())
        .catch((error) => {
          this.$store
            .dispatch('updateLocalErrors', error)
        })
    },
    changeDepartment () {
      this.$db
        .collection('workOrders')
        .doc(this.$route.params.id)
        .update({ department: this.workOrder.department })
        .then(() => this.confirmDepartment())
        .catch((error) => {
          this.$store
            .dispatch('updateLocalErrors', error)
        })
    },
    changeDepartmentsStaff () {
      this.$db
        .collection('workOrders')
        .doc(this.$route.params.id)
        .update({ staffDepartment: this.workOrder.staffDepartment })
        .then(() => this.confirmStaffDepartment())
        .catch((error) => {
          this.$store
            .dispatch('updateLocalErrors', error)
        })
    },
    close () {
      this.$db
        .collection('workOrders')
        .doc(this.$route.params.id)
        .update({
          closedDate: this.$firebase.firestore.Timestamp.now(),
          lastUpdated: this.$firebase.firestore.Timestamp.now(),
          status: 'Closed'
        })
        .then(() => this.$router.go(-1))
        .catch((error) => {
          this.$store
            .dispatch('updateLocalErrors', error)
        })
    },
    confirmBuilding () {
      this.buildingIcon = 'mdi-check-circle'
      setTimeout(() => {
        this.buildingIcon = ''
      }, 3000)
    },
    confirmDepartment () {
      this.departmentIcon = 'mdi-check-circle'
      setTimeout(() => {
        this.departmentIcon = ''
      }, 3000)
    },
    confirmStaffDepartment () {
      this.departmentsStaffIcon = 'mdi-check-circle'
      setTimeout(() => {
        this.departmentsStaffIcon = ''
      }, 3000)
    },
    confirmReassign () {
      this.workerIcon = 'mdi-check-circle'
      setTimeout(() => {
        this.workerIcon = ''
      }, 3000)
    },
    deleteIt () {
      this.delLoading = true
      this.$db
        .collection('workOrders')
        .doc(this.$route.params.id)
        .delete()
        .then(() => {
          this.delLoading = false
          this.$router.go(-1)
        })
        .catch((error) => {
          this.delLoading = false
          this.$store
            .dispatch('updateLocalErrors', error)
        })
    },
    getData () {
      if (this.unsubTicket) { this.unsubTicket() }
      this.$store
        .dispatch('getWorkers')
        .catch((error) => {
          this.$store
            .dispatch('updateLocalErrors', error)
        })
      this.unsubTicket = this.$db
        .collection('workOrders')
        .doc(this.$route.params.id)
        .onSnapshot((doc) => {
          this.workOrder = doc.data()
          this.workOrder.id = doc.id
          if (this.workOrder.status === 'Open') {
            const start = new Date(this.processDate(this.workOrder.createdDate))
            const sla = (this.workOrder.department !== 'dietary') ? new Date(start.getTime() + 7 * 24 * 60 * 60 * 1000) : new Date(start.getTime() + 30 * 24 * 60 * 60 * 1000)
            if (new Date() > sla) {
              this.workOrder.status = 'Past Due'
            }
          }
          this.workOrder.createdDate = this.processDate(this.workOrder.createdDate)
          this.workOrder.lastUpdated = (this.workOrder.lastUpdated) ? this.processDate(this.workOrder.lastUpdated) : null
          this.workOrder.closedDate = (this.workOrder.closedDate) ? this.processDate(this.workOrder.closedDate) : null
          if (this.workOrder.workOrderType && this.workOrder.workOrderType === 'PM') {
            this.isPM = true
            if (this.workOrder.steps && Array.isArray(this.workOrder.steps) && this.workOrder.steps.length > 0) {
              for (let i = 0; i < this.workOrder.steps.length; i++) {
                if (this.workOrder.steps[i].type === 'checkbox' && !Array.isArray(this.workOrder.steps[i].value)) {
                  this.workOrder.steps[i].value = []
                }
              }
            }
          }
          if (this.workOrder.userId) {
            this.$db
              .collection('users')
              .doc(this.workOrder.userId)
              .get()
              .then((doc) => {
                this.ownerEmail = doc.data().email
                this.ownerName = doc.data().displayName
              })
              .catch((error) => {
                this.$store
                  .dispatch('updateLocalErrors', error)
              })
          }
          if (this.workOrder.reopened && Array.isArray(this.workOrder.reopened) && this.workOrder.reopened.length > 0) {
            for (let i = 0; i < this.workOrder.reopened.length; i++) {
              this.lastReopen = this.workOrder.reopened[i].date
            }
          }
          if (this.workOrder.assignedTo && this.workOrder.assignedTo.workerId) {
            this.workerId = this.workOrder.assignedTo.workerId
          }
          console
            .log(this.workOrder)
        }, (error) => {
          this.$store
            .dispatch('updateLocalErrors', error)
        })
    },
    changeSubject () {
      this.subjectLoading = true
      this.$db
        .collection('workOrders')
        .doc(this.$route.params.id)
        .update({
          lastUpdated: this.$firebase.firestore.Timestamp.now(),
          subject: this.workOrder.subject
        })
        .then(() => {
          this.subjectLoading = false
          this.subjectModal = false
        })
        .catch((error) => {
          this.$store
            .dispatch('updateLocalErrors', error)
        })
    },
    open () {
      this.reopenLoading = true
      if (this.iAmClaims.admin || this.iAmClaims.managerMaint) {
        const setReopened = (date) => {
          return new Promise((resolve, reject) => {
            try {
              if (this.workOrder.reopened && Array.isArray(this.workOrder.reopened)) {
                this.workOrder.reopened
                  .push({
                    date: this.$firebase.firestore.Timestamp.now(),
                    previousClose: this.workOrder.closedDate,
                    user: {
                      displayName: this.$firebase.auth().currentUser.displayName,
                      uid: this.$firebase.auth().currentUser.uid
                    }
                  })
              } else {
                this.workOrder.reopened = [{
                  date: this.$firebase.firestore.Timestamp.now(),
                  previousClose: this.workOrder.closedDate,
                  user: {
                    displayName: this.$firebase.auth().currentUser.displayName,
                    uid: this.$firebase.auth().currentUser.uid
                  }
                }]
              }
              resolve({ reopened: this.workOrder.reopened })
            } catch (error) {
              reject(error)
            }
          })
        }
        setReopened()
          .then((response) => this.$db
            .collection('workOrders')
            .doc(this.$route.params.id)
            .update({
              lastUpdated: this.$firebase.firestore.Timestamp.now(),
              reopened: response.reopened,
              status: 'Open'
            })
          )
          .then((response) => {
            this.reopenLoading = false
            this.workOrder.status = 'Open'
          })
          .catch((error) => {
            this.reopenLoading = false
            this.$store
              .dispatch('updateLocalErrors', error)
          })
      } else {
        this.$axios
          .request('/workorder/open', {
            method: 'POST',
            data: {
              link: `/${this.$route.fullPath}`,
              user: this.$firebase.auth().currentUser.displayName
            }
          })
          .then((response) => {
            this.dialog = true
            this.reopenLoading = false
          })
          .catch((error) => {
            this.reopenLoading = false
            this.$store
              .dispatch('updateLocalErrors', error)
          })
      }
    },
    print () {
      const prtHtml = document.getElementById('ticket').innerHTML
      let stylesHtml = ''
      for (const node of [...document.querySelectorAll('link[rel="stylesheet"], style')]) {
        stylesHtml += node.outerHTML
      }
      const WinPrint = window.open('', '', 'left=0,top=0,width=800,height=900,toolbar=0,scrollbars=0,status=0')
      WinPrint.document
        .write(`<!DOCTYPE html><html><head>${stylesHtml}</head><body>${prtHtml}</body></html>`)
      WinPrint.document
        .close()
      WinPrint
        .focus()
      WinPrint
        .print()
      WinPrint
        .close()
    },
    processDate (date) {
      if (typeof date === 'object') {
        return this.$moment(date.toDate()).format('MM/DD/YYYY hh:mm:ss A')
      } else {
        return date
      }
    },
    save () {
      this.saveLoading = true
      this.$store
        .dispatch('getDateAndTime')
        .then((response) => this.$db
          .collection('workOrders')
          .doc(this.$route.params.id)
          .update(this.workOrder)
        )
        .then(() => {
          this.saveLoading = false
        })
        .catch((error) => {
          this.saveLoading = false
          this.$store
            .dispatch('updateLocalErrors', error)
        })
    },
    saveQuickNote () {
      if (!this.workOrder.quickNote) { return alert('You did not add a note!') }
      this.quickNoteLoading = true
      const common = [
        'a',
        'and',
        'are',
        'do',
        'doing',
        'done',
        'i',
        'in',
        'is',
        'it',
        'its',
        'for',
        'me',
        'mine',
        'my',
        'of',
        'or',
        'our',
        'so',
        'that',
        'the',
        'their',
        'them',
        'there',
        'they',
        'theyre',
        'this',
        'to',
        'us',
        'we'
      ]
      const noHtml = (this.workOrder.quickNote) ? this.strip(this.workOrder.quickNote) : null
      const noNumbers = (noHtml) ? noHtml.replace(/[0-9]/g, ' ') : null
      const text = (noNumbers) ? noNumbers.replace(/[^\w\s]/gi, ' ') : null
      const whiteSpacetoComma = (text) ? text.replace(/\s/g, ',') : null
      const lowerCase = (whiteSpacetoComma) ? whiteSpacetoComma.toLowerCase() : null
      const arr = (lowerCase) ? lowerCase.split(',') : []
      let c = arr.length
      while (c--) {
        if (arr[c] === '') {
          arr
            .splice(c, 1)
        } else if (common.includes(arr[c])) {
          arr
            .splice(c, 1)
        }
      }
      // Remove duplicate entries
      const filtered = arr.filter((elem, index, self) => { return index === self.indexOf(elem) })
      const descIndex = (this.workOrder.descIndex) ? this.workOrder.descIndex.concat(filtered) : filtered
      this.$db
        .collection('workOrders')
        .doc(this.$route.params.id)
        .update({
          descIndex,
          quickNote: this.workOrder.quickNote
        })
        .then(() => {
          this.quickNoteModal = false
          this.quickNoteLoading = false
        })
        .catch((error) => {
          this.quickNoteLoading = false
          this.$store
            .dispatch('updateLocalErrors', error)
        })
    },
    setPriority (data) {
      this.priorityLoading = true
      this.$db
        .collection('workOrders')
        .doc(this.$route.params.id)
        .update({ priority: data })
        .then(() => {
          this.priorityLoading = false
        })
        .catch((error) => {
          this.priorityLoading = false
          this.$store
            .dispatch('updateLocalErrors', error)
        })
    },
    setRead () {
      if (!this.workOrder || !this.$firebase.auth().currentUser) { return setTimeout(() => { this.setRead() }, 250) }
      const unreadComments = (this.workOrder.unreadComments) ? this.workOrder.unreadComments : {}
      const read = (this.workOrder.read) ? this.workOrder.read : {}
      read[this.$firebase.auth().currentUser.uid] = true
      unreadComments[this.$firebase.auth().currentUser.uid] = 0
      this.$db
        .collection('workOrders')
        .doc(this.$route.params.id)
        .update({
          read,
          unreadComments
        })
        .catch((error) => {
          this.$store
            .dispatch('updateLocalErrors', error)
        })
    },
    // Remove html from data
    strip (html) {
      const doc = new DOMParser().parseFromString(html, 'text/html')
      return doc.body.textContent || null
    }
  }
}
</script>
