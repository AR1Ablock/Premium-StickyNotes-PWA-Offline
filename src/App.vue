<template>
  <div class="wrapper">
    <!-- Loading Screen -->
    <div class="loading" v-if="Remove_Loading_Screen" :class="{ active: !Loading }">
      <p></p>
      <h1>Loading Notes...</h1>
    </div>

    <!-- Header -->
    <div class="Top_Container">
      <div class="searchbar" :class="{ active: Blur_Background_WhileOpening_Note }">
        <h1>Sticky Notes</h1>
        <div class="search-container">
          <input
            type="text"
            placeholder="Search notes..."
            class="searchinput showinput"
            ref="SearchInput_Element"
            v-model.trim="inputData"
            @input="Debounce_Search"
            @keydown.enter.prevent
          />
          <svg viewBox="0 0 24 24">
            <path
              d="M21.71 20.29l-3.388-3.388a8.063 8.063 0 10-1.414 1.414l3.388 3.388a1 1 0 001.414-1.414zM10 16a6 6 0 110-12 6 6 0 010 12z"
            />
          </svg>
        </div>
        <button class="btn addbtn" @click="AddNoteBtn" title="Add Note">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <rect
              x="3"
              y="3"
              width="18"
              height="18"
              rx="2"
              ry="2"
              stroke="currentColor"
              fill="none"
            />
            <line x1="12" y1="8" x2="12" y2="16" stroke="currentColor" />
            <line x1="8" y1="12" x2="16" y2="12" stroke="currentColor" />
          </svg>
        </button>
      </div>
    </div>

    <div
      class="card_con"
      :class="[
        { active: Blur_Background_WhileOpening_Note },
        { Screen_load_animation_end: Loading_screen_end_then_animate_notes_card_con },
      ]"
    >
      <div
        class="empty_card_container"
        v-if="data.length > 0"
        style="display: none"
        ref="No_Notes_Found_Message_Element"
      >
        <p class="empty_card_container_message">No Notes Found</p>
      </div>

      <!-- Cards -->
      <div
        class="cards"
        ref="Card"
        v-for="(item, index) in data"
        :key="`${item.id}-${index}-${sort_order}`"
        :class="[{ smoothhide: data[index].isCardGoingDeleted }]"
        :style="{ 'background-color': data[index].Card_Para_Color }"
      >
        <div
          class="Title_Con"
          :style="{ 'background-color': data[index].Card_Title_Color }"
        >
          <p class="Card_Title">{{ item.title.substring(0, 18) }}</p>
        </div>
        <div class="Para_Con" @click="RO_ViewNotePage(index)">
          <p class="Card_Para">{{ getShortText(item.userWrote) }}</p>
        </div>
        <div
          class="Upload_Loader Upload_Loader_active"
          v-show="data[index].IsLoading"
        ></div>
        <div class="extra" :style="{ 'background-color': data[index].Card_Footer_Color }">
          <div class="card_footer">
            <h4>{{ item.NotesDate }}</h4>

            <div class="notes_card_footer_btn_container">
              <button class="edit" @click="EditBtn(index)" title="Edit Note">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                >
                  <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
                </svg>
              </button>

              <button class="delete" @click="DeleteCard(index)" title="Delete Note">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                >
                  <path d="M3 6h18" />
                  <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                  <path d="M10 11v6" />
                  <path d="M14 11v6" />
                  <path d="M5 6l1 14a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2l1-14" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
      <div class="empty_card_container" v-if="data.length <= 0">
        <p class="empty_card_container_message">No Cards Available</p>
      </div>
    </div>

    <!-- Notes Making UI -->
    <div
      class="create_edit_model_container"
      @click.self="CloseBtn(null, 'note_making', null)"
      :class="{ active: isAddBtnPressed }"
    >
      <dialog open="" ref="Note_Making_UI_Element" class="dialog">
        <div class="create_edit_model_header">
          <h3 ref="Note_heading_element" class="model_h3">Create Note</h3>

          <div class="attachmentBtns">
            <label for="fileInput" class="custom_Choose_file" title="Attach File">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#FFD700"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <!-- Folder Outline -->
                <path
                  d="M2 7C2 5.9 2.9 5 4 5H10L12 7H20C21.1 7 22 7.9 22 9V19C22 20.1 21.1 21 20 21H4C2.9 21 2 20.1 2 19V7Z"
                ></path>
                <!-- Document Outline -->
                <rect
                  x="6.5"
                  y="9"
                  width="11"
                  height="10"
                  stroke="white"
                  stroke-width="1.5"
                ></rect>
                <line
                  x1="8"
                  y1="11"
                  x2="14"
                  y2="11"
                  stroke="white"
                  stroke-width="1.5"
                ></line>
                <line
                  x1="8"
                  y1="13"
                  x2="14"
                  y2="13"
                  stroke="white"
                  stroke-width="1.5"
                ></line>
              </svg>
            </label>

            <input type="file" id="fileInput" @change="manageMedia" />

            <button ref="recordAudioButton" @click="AudioRec" title="Record Audio">
              <svg
                v-show="Is_Audio_Recording"
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="white"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <circle cx="12" cy="12" r="9"></circle>
                <rect x="9" y="9" width="6" height="6" rx="1" fill="#FFD700"></rect>
              </svg>

              <svg v-show="!Is_Audio_Recording" viewBox="0 0 24 24">
                <path d="M12 14a3 3 0 003-3V5a3 3 0 00-6 0v6a3 3 0 003 3z"></path>
                <path
                  d="M19 11a1 1 0 00-1 1v1a6 6 0 01-12 0v-1a1 1 0 00-2 0v1a8 8 0 008 8 8 8 0 008-8v-1a1 1 0 00-1-1z"
                ></path>
              </svg>
            </button>

            <button
              ref="recordVideoButton"
              v-show="!Front_Back_Camera"
              @click="VideoRec"
              title="Record Video"
            >
              <svg
                v-show="Is_Video_Recording"
                style="width: 4vmin !important"
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="white"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <circle cx="12" cy="12" r="9"></circle>
                <rect x="9" y="9" width="6" height="6" rx="1" fill="#FFD700"></rect>
              </svg>

              <svg v-show="!Is_Video_Recording" viewBox="0 0 24 24">
                <path
                  d="M17 10.5v-2A2.5 2.5 0 0014.5 6h-9A2.5 2.5 0 003 8.5v7A2.5 2.5 0 005.5 18h9a2.5 2.5 0 002.5-2.5v-2l4 3v-9l-4 3z"
                ></path>
              </svg>
            </button>

            <button
              @click="
                Is_FlashLight_On = !Is_FlashLight_On;
                Toggle_Torch();
              "
              class="torch"
              :class="{ Flash_light_not_available: !Is_FlashLight_Supported }"
              ref="flash_light_btn_element"
              title="Flash Light"
            >
              <!-- 24×24 Lightning Icon (OFF by default) -->
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="32"
                height="32"
                viewBox="0 0 20 20"
              >
                <!-- Lightning bolt path -->
                <path
                  :class="[
                    { flash_light_on: Is_FlashLight_On },
                    { Flash_light_not_available: !Is_FlashLight_Supported },
                  ]"
                  d="M13 4 L7 14 h4 l-1 6 l7-12 h-4 Z"
                  fill="none"
                  stroke="#FFD700"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>
            </button>

            <button
              id="useFrontCamera"
              v-show="Front_Back_Camera"
              @click="FrontCamVideoRec"
              title="Front Camera"
            >
              <svg
                width="100"
                height="100"
                viewBox="0 -2 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                stroke="gold"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <rect
                  x="3"
                  y="6"
                  width="18"
                  height="12"
                  rx="2"
                  ry="2"
                  stroke="gold"
                  fill="none"
                />
                <circle cx="12" cy="12" r="3" stroke="gold" />
                <circle cx="18" cy="8" r="1" fill="gold" />
                <rect x="8" y="3" width="8" height="2" rx="1" fill="gold" />
              </svg>
            </button>

            <button
              id="useBackCamera"
              v-show="Front_Back_Camera"
              @click="BackCamVideoRec"
              title="Back Camera"
            >
              <svg
                width="24"
                height="24"
                viewBox="2 0 20 20"
                stroke="white"
                xmlns="http://www.w3.org/2000/svg"
              >
                <!-- Camera Body -->
                <rect
                  x="3"
                  y="4"
                  width="18"
                  height="14"
                  rx="2"
                  stroke="gold"
                  stroke-width="2"
                />

                <!-- Lens -->
                <circle cx="9" cy="12" r="4" stroke="black" stroke-width="2" />

                <!-- Flash -->
                <circle cx="18" cy="10" r="2.5" fill="black" />
              </svg>
            </button>

            <button
              v-if="disable_color_notes_switcher_btn"
              class="toggle_note_color_mode"
              @click="Toggle_Note_Card_Color_Mode"
              title="Toggle Note Color"
            >
              <svg
                width="100"
                height="100"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <!-- Sticky Note Shape -->
                <rect
                  x="4"
                  y="4"
                  width="16"
                  height="16"
                  rx="2"
                  ry="2"
                  fill="gray"
                  stroke="gold"
                  stroke-width="1.5"
                />
                <!-- Colorful Half -->
                <path
                  d="M12 4h8v16h-8z"
                  fill="url(#grad1)"
                  stroke="black"
                  stroke-width="1.5"
                />
                <!-- Toggle Indicator -->
                <circle
                  :class="{
                    color_full_notes_card_active_toggler: Is_Sticky_Colorful_Card,
                  }"
                  cx="18"
                  cy="18"
                  r="5"
                  fill="gray"
                  stroke="black"
                  stroke-width="1"
                />
                <path
                  :class="{ color_full_notes_card_active_line: Is_Sticky_Colorful_Card }"
                  d="M16 18h4"
                  stroke="black"
                  stroke-width="1.5"
                  stroke-linecap="round"
                />
                <defs>
                  <linearGradient id="grad1" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stop-color="#FF4500" />
                    <stop offset="50%" stop-color="#FFD700" />
                    <stop offset="100%" stop-color="#00FF00" />
                  </linearGradient>
                </defs>
              </svg>
            </button>
          </div>
        </div>

        <div class="recording_preview_container" v-if="isAddBtnPressed">
          <!-- Edit Mode -->
          <!-- Video Preview -->
          <div
            class="Video_Preview_Container"
            v-show="Edit_Mode_Toggle_Video_Preview && EditMode"
          >
            <span class="Close_Video_Preview_Btn" @click="Close_Video_Audio_Preview">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <path d="M18 6L6 18"></path>
                <path d="M6 6l12 12"></path>
              </svg>
            </span>

            <video
              class="Video_Preview"
              ref="Edit_Mode_Video_Preview_Element"
              controls
              autoplay
              preload="auto"
            ></video>
          </div>

          <!-- Audio Preview -->
          <div
            class="Audio_Preview_Container"
            v-show="Edit_Mode_Toggle_Audio_Preview && EditMode"
          >
            <span class="Close_Audio_Preview_Btn" @click="Close_Video_Audio_Preview">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <path d="M18 6L6 18"></path>
                <path d="M6 6l12 12"></path>
              </svg>
            </span>
            <audio
              class="Audio_Preview"
              ref="Edit_Mode_Audio_Preview_Element"
              controls
              autoplay
              preload="auto"
            ></audio>
          </div>
          <!-- Edit Mode End -->

          <!-- Done Mode -->
          <!-- Video Preview -->
          <div
            class="Video_Preview_Container"
            v-show="Done_Mode_Toggle_Video_Preview && !EditMode"
          >
            <span class="Close_Video_Preview_Btn" @click="Close_Video_Audio_Preview">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <path d="M18 6L6 18"></path>
                <path d="M6 6l12 12"></path>
              </svg>
            </span>
            <video
              class="Video_Preview"
              ref="Done_Mode_Video_Preview_Element"
              controls
              autoplay
              preload="auto"
            ></video>
          </div>

          <!-- Audio Preview -->
          <div
            class="Audio_Preview_Container"
            v-show="Done_Mode_Toggle_Audio_Preview && !EditMode"
          >
            <span class="Close_Audio_Preview_Btn" @click="Close_Video_Audio_Preview">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <path d="M18 6L6 18"></path>
                <path d="M6 6l12 12"></path>
              </svg>
            </span>
            <audio
              class="Audio_Preview"
              ref="Done_Mode_Audio_Preview_Element"
              controls
              autoplay
              preload="auto"
            ></audio>
          </div>
        </div>

        <!-- Done Mode End -->
        <input
          ref="focusOnInput"
          type="text"
          class="title"
          placeholder="Note Title"
          v-model.trim="CurrentlyWritingTitle"
        />

        <!--  -->
        <div
          class="delete-modal"
          id="deleteModal"
          :class="{ active: toggle_delete_model }"
        >
          <div class="header">
            <h2>Attachments</h2>
            <button
              class="close-modal"
              @click="
                toggle_delete_model = false;
                Close_Btn_Sound.play();
              "
              title="Close_Attachments_Panel"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="3"
                stroke-linecap="round"
                stroke-linejoin="round"
                class="feather feather-x"
              >
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>

          <!-- Video Section -->
          <div class="all_media_types_container">
            <div class="section">
              <div class="section-title">Video</div>
              <div class="scrollable">
                <ul class="media-list" v-if="Video_Array.length > 0">
                  <li
                    class="items"
                    :key="index"
                    v-for="(item, index) in Video_Array"
                    :class="{
                      media_and_file_delete_animation: item?.deletion,
                    }"
                  >
                    <span>{{ item?.name }}</span>
                    <button
                      class="delete-btn"
                      @click="delete_media(index, 'video')"
                      title="Delete Video"
                    >
                      🗑
                    </button>
                  </li>
                </ul>
                <p class="empty-message" v-if="Video_Array.length <= 0">
                  No video files available
                </p>
              </div>
            </div>

            <!-- Audio Section -->
            <div class="section">
              <div class="section-title">Audio</div>
              <div class="scrollable">
                <ul class="recording-list" v-if="Audio_Array.length > 0">
                  <li
                    class="items"
                    :key="index"
                    v-for="(item, index) in Audio_Array"
                    :class="{
                      media_and_file_delete_animation: item?.deletion,
                    }"
                  >
                    <span>{{ item?.name }}</span>
                    <button
                      class="delete-btn"
                      @click="delete_media(index, 'audio')"
                      title="Delete Audio"
                    >
                      🗑
                    </button>
                  </li>
                </ul>
                <p class="empty-message" v-if="Audio_Array.length <= 0">
                  No audio files available
                </p>
              </div>
            </div>

            <!-- Image Section -->
            <div class="section">
              <div class="section-title">Images</div>
              <div class="scrollable">
                <ul class="file-list" v-if="Image_Array.length > 0">
                  <li
                    class="items"
                    :key="index"
                    v-for="(item, index) in Image_Array"
                    :class="{ media_and_file_delete_animation: item?.deletion }"
                  >
                    <span>{{ item?.name }}</span>
                    <button
                      class="delete-btn"
                      @click="delete_media(index, 'image')"
                      title="Delete Image"
                    >
                      🗑
                    </button>
                  </li>
                </ul>
                <p class="empty-message" v-if="Image_Array.length <= 0">
                  No image files available
                </p>
              </div>
            </div>

            <!-- Docs Section -->
            <div class="section">
              <div class="section-title">Documents</div>
              <div class="scrollable">
                <ul class="file-list" v-if="Document_Array.length > 0">
                  <li
                    class="items"
                    :key="index"
                    v-for="(item, index) in Document_Array"
                    :class="{
                      media_and_file_delete_animation: item?.deletion,
                    }"
                  >
                    <span>{{ item?.name }}</span>
                    <button
                      class="delete-btn"
                      @click="delete_media(index, 'doc')"
                      title="Delete Document"
                    >
                      🗑
                    </button>
                  </li>
                </ul>
                <p class="empty-message" v-if="Document_Array.length <= 0">
                  No document files available
                </p>
              </div>
            </div>
          </div>
        </div>
        <!--  -->

        <div class="notes_Writing_Area_Wrapper">
          <textarea
            name="notewriting"
            class="model_note"
            ref="TextAreaElement"
            cols="30"
            rows="10"
            placeholder="Write Your Thoughts"
            v-model.trim="CurrentlyWritingMessage"
          >
          </textarea>
          <video class="vid" ref="videoPreview" autoplay muted></video>
        </div>

        <!-- Overlay for Audio Recording -->
        <div id="overlay" ref="overlayElement">
          <div class="sound-bars">
            <div></div>
            <div></div>
            <div></div>
          </div>
        </div>

        <div class="note_create_edit_model_btns_container">
          <button
            class="btn delete_media_panel_toggle_btn"
            @click="
              toggle_delete_model = !toggle_delete_model;
              View_Btn_Sound.play();
            "
            title="View Attachments Deletion Panel"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <!-- Trash Bin -->
              <path d="M4 6h16" stroke="currentColor"></path>
              <path
                d="M7 6V4a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v2"
                stroke="currentColor"
              ></path>
              <path
                d="M5 6l1 14a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2l1-14"
                stroke="currentColor"
              ></path>

              <!-- File Icon Inside Trash Bin -->
              <rect
                x="9"
                y="9"
                width="6"
                height="8"
                rx="1"
                stroke="currentColor"
                fill="none"
              ></rect>
              <path d="M9 9l3-3 3 3" stroke="currentColor" fill="none"></path>

              <!-- "X" Symbol Over File -->
              <line x1="10" y1="12" x2="14" y2="16" stroke="currentColor"></line>
              <line x1="14" y1="12" x2="10" y2="16" stroke="currentColor"></line>
            </svg>
          </button>

          <div
            :class="{
              Load_All_Notes_Container_Show_override_position: Attachment_Capacity_Violation_Toggle_Message,
            }"
            class="Load_All_Notes_Container override_Load_All_Notes_Container_position"
          >
            <h3 ref="Note_Attachment_Limit_Warning_Message" style="color: #1b1b1b">
              ✨ Not Enough Capacity Left! ✨
            </h3>
            <button
              @click="Attachment_Capacity_Violation_Toggle_Message = false"
              class="Load_All_Notes_Container_Close_Btn"
              title="Close Attachment Capacity Violation Message"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <path d="M18 6L6 18" />
                <path d="M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div class="edit_create_done_close_btn">
            <button
              ref="Note_Createt_Close_btn"
              @click="CloseBtn(null, 'note_making', null)"
              class="btn close_note_create_edit_btn"
              title="Close"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <path d="M18 6L6 18"></path>
                <path d="M6 6l12 12"></path>
              </svg>
            </button>
            <button @click="DoneBtn" ref="DisableDoneBtnElement" class="btn" title="Done">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <path d="M20 6L9 17l-5-5"></path>
              </svg>
            </button>
          </div>
        </div>
      </dialog>
    </div>

    <!-- View Notes UI -->
    <div
      class="Notes_View_UI_Container"
      :class="{ active: IsRoViewNoteOpen }"
      @click.self="CloseBtn($event, null, 'ovl')"
    >
      <dialog
        ref="note_view_ui_element"
        open=""
        class="notepage"
        :class="{
          notepage_full_screen: Toggle_Reading_Form_Full_Screen,
        }"
        :style="boxStyle"
      >
        <div
          class="notepag_con"
          ref="View_Note_Page_UI"
          :class="{ notepag_con_full_screen: Toggle_Reading_Form_Full_Screen }"
        >
          <section class="Notepage_View_Full_Screen_And_Change_Color_Container">
            <p class="Notes_View_UI_Heading">Read Mode</p>
            <div class="View_Content_buttons">
              <button class="btn" @click="Toggle_Note_Full_Screen" title="Full Screen">
                <svg
                  v-show="!Toggle_Reading_Form_Full_Screen"
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="#2A2A2A"
                  stroke="#2A2A2A"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                >
                  <polyline points="9 3, 3 3, 3 9"></polyline>
                  <line x1="3" y1="3" x2="9" y2="9"></line>

                  <polyline points="15 3, 21 3, 21 9"></polyline>
                  <line x1="21" y1="3" x2="15" y2="9"></line>

                  <polyline points="9 21, 3 21, 3 15"></polyline>
                  <line x1="3" y1="21" x2="9" y2="15"></line>

                  <polyline points="15 21, 21 21, 21 15"></polyline>
                  <line x1="21" y1="21" x2="15" y2="15"></line>
                </svg>
                <!-- ------------------------- -->
                <svg
                  v-show="Toggle_Reading_Form_Full_Screen"
                  height="24"
                  width="24"
                  version="1.1"
                  id="Capa_1"
                  xmlns="http://www.w3.org/2000/svg"
                  xmlns:xlink="http://www.w3.org/1999/xlink"
                  viewBox="0 0 13.594 13.594"
                  xml:space="preserve"
                >
                  <g>
                    <g>
                      <path
                        style="fill: #2a2a2a"
                        d="M0.035,1.76c0.632,0.631,1.6,1.601,2.185,2.186c0.253,0.252,0.417,0.416,0.417,0.416
			S1.963,5.039,1.682,5.318C1.403,5.596,1.903,5.583,1.903,5.583L5.65,5.937c0,0,0.304,0.025,0.304-0.268
			c0-0.401-0.474-3.761-0.474-3.761s0-0.511-0.339-0.171c-0.34,0.342-0.884,0.884-0.884,0.884S4.11,2.473,3.884,2.246
			C3.312,1.674,2.303,0.666,1.67,0.033C1.439,0.842,0.825,1.487,0.035,1.76z"
                      ></path>
                      <path
                        style="fill: #2a2a2a"
                        d="M7.896,11.58c0,0-0.001,0.512,0.339,0.172s0.885-0.883,0.885-0.883s0.146,0.146,0.372,0.373
			c0.601,0.602,1.689,1.689,2.312,2.313c0.294-0.781,0.957-1.381,1.776-1.586c-0.598-0.6-1.758-1.76-2.423-2.426
			c-0.253-0.252-0.418-0.416-0.418-0.416s0.677-0.678,0.955-0.955c0.28-0.279-0.221-0.266-0.221-0.266L7.727,7.551
			c0,0-0.303-0.021-0.303,0.27C7.424,8.221,7.896,11.58,7.896,11.58z"
                      ></path>
                      <path
                        style="fill: #2a2a2a"
                        d="M1.716,13.561c0.614-0.613,1.721-1.721,2.363-2.363c0.251-0.252,0.416-0.416,0.416-0.416
			s0.677,0.678,0.957,0.957c0.279,0.277,0.265-0.223,0.265-0.223L6.07,7.77c0,0,0.025-0.303-0.267-0.303
			C5.4,7.467,2.04,7.94,2.04,7.94S1.529,7.938,1.87,8.28c0.341,0.338,0.883,0.881,0.883,0.881S2.606,9.309,2.378,9.536
			C1.754,10.159,0.607,11.309,0,11.915C0.806,12.151,1.448,12.768,1.716,13.561z"
                      ></path>
                      <path
                        style="fill: #2a2a2a"
                        d="M13.594,1.685c-0.629,0.629-1.644,1.644-2.247,2.249c-0.252,0.251-0.417,0.414-0.417,0.414
			s0.676,0.677,0.955,0.957c0.28,0.28-0.22,0.266-0.22,0.266L7.917,5.925c0,0-0.302,0.024-0.302-0.269
			c0-0.402,0.472-3.761,0.472-3.761s-0.002-0.511,0.34-0.172C8.766,2.065,9.31,2.606,9.31,2.606S9.458,2.46,9.683,2.232
			c0.551-0.55,1.508-1.509,2.146-2.144C12.117,0.871,12.776,1.472,13.594,1.685z"
                      ></path>
                    </g>
                  </g>
                </svg>
              </button>

              <button
                @click="align_Note_View_UI_Text"
                class="btn"
                title="Change Text Alignment"
              >
                <svg
                  v-show="Alignment_index == 0"
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="#2A2A2A"
                  stroke="#2A2A2A"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                >
                  <line x1="3" y1="6" x2="21" y2="6"></line>
                  <line x1="3" y1="12" x2="15" y2="12"></line>
                  <line x1="3" y1="18" x2="21" y2="18"></line>
                </svg>

                <svg
                  v-show="Alignment_index == 1"
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="#2A2A2A"
                  stroke="#2A2A2A"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                >
                  <line x1="6" y1="6" x2="18" y2="6"></line>
                  <line x1="3" y1="12" x2="21" y2="12"></line>
                  <line x1="6" y1="18" x2="18" y2="18"></line>
                </svg>

                <svg
                  v-show="Alignment_index == 2"
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="#2A2A2A"
                  stroke="#2A2A2A"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                >
                  <line x1="3" y1="6" x2="21" y2="6"></line>
                  <line x1="9" y1="12" x2="21" y2="12"></line>
                  <line x1="3" y1="18" x2="21" y2="18"></line>
                </svg>
              </button>

              <button
                class="btn"
                :style="buttonStyle"
                @click="changeColor"
                title="Change Color"
              >
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 16 16"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    fill-rule="evenodd"
                    clip-rule="evenodd"
                    d="M16 8C16 8.33866 15.979 8.67241 15.9381 9H8V11L11 14V15.4185C10.0736 15.7935 9.0609 16 8 16C3.58172 16 0 12.4183 0 8C0 3.58172 3.58172 0 8 0C12.4183 0 16 3.58172 16 8ZM3 9C3.55228 9 4 8.55229 4 8C4 7.44772 3.55228 7 3 7C2.44772 7 2 7.44772 2 8C2 8.55229 2.44772 9 3 9ZM9 3C9 3.55228 8.55229 4 8 4C7.44772 4 7 3.55228 7 3C7 2.44772 7.44772 2 8 2C8.55229 2 9 2.44772 9 3ZM5.17137 5.17158C5.56189 4.78106 5.56189 4.14789 5.17137 3.75737C4.78084 3.36685 4.14768 3.36685 3.75716 3.75737C3.36663 4.14789 3.36663 4.78106 3.75716 5.17158C4.14768 5.56211 4.78084 5.56211 5.17137 5.17158ZM12.2428 5.17161C11.8522 5.56214 11.2191 5.56214 10.8285 5.17161C10.438 4.78109 10.438 4.14792 10.8285 3.7574C11.2191 3.36688 11.8522 3.36688 12.2428 3.7574C12.6333 4.14792 12.6333 4.78109 12.2428 5.17161ZM5.17146 10.8284C4.78094 10.4379 4.14777 10.4379 3.75725 10.8284C3.36672 11.2189 3.36672 11.8521 3.75725 12.2426C4.14777 12.6331 4.78094 12.6331 5.17146 12.2426C5.56199 11.8521 5.56199 11.2189 5.17146 10.8284Z"
                    fill="#2A2A2A"
                  ></path>
                </svg>
              </button>
            </div>
          </section>

          <pre class="View_Text_In_UI View_Text_In_UI_Title">{{
            SendNoteForView_Title
          }}</pre>
          <pre ref="Note_View_UI_Text_Element" class="View_Text_In_UI">{{
            SendNoteForView_Message
          }}</pre>

          <div class="media_in_note_view_ui">
            <div class="media_in_note_view_ui_width">
              <div
                class="img"
                v-for="(item, index) in SendImageForView"
                :key="`${index}-${refreshKey}`"
              >
                <div class="Upload_Loader Upload_Loader_active_media"></div>
                <img v-loader="item.Data" alt="" srcset="" ref="media" />
              </div>

              <div
                class="audio"
                v-for="(item, index) in SendAudioForView"
                :key="`${index}-${refreshKey}`"
              >
                <div class="Upload_Loader Upload_Loader_active_media"></div>
                <audio
                  ref="media"
                  preload="auto"
                  v-loader="item.Data"
                  controls
                  muted
                ></audio>
              </div>

              <div
                class="video"
                v-for="(item, index) in SendVideoForView"
                :key="`${index}-${refreshKey}`"
              >
                <div class="Upload_Loader Upload_Loader_active_media"></div>
                <video
                  @click="
                    event.target.paused ? event.target.play() : event.target.pause()
                  "
                  ref="media"
                  preload="auto"
                  v-loader="item.Data"
                  controls
                  muted
                ></video>
                <div class="video_overlay" @click="Remove_Video_Overlay($event)"></div>
              </div>

              <div
                class="document"
                v-for="(item, index) in SendDocumentForView"
                :key="`${index}-${refreshKey}`"
              >
                <svg
                  width="100"
                  height="120"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M6 2C5.44772 2 5 2.44772 5 3V21C5 21.5523 5.44772 22 6 22H18C18.5523 22 19 21.5523 19 21V8.41421C19 8.149 18.8946 7.89464 18.7071 7.70711L13.2929 2.29289C13.1054 2.10536 12.851 2 12.5858 2H6Z"
                    fill="black"
                    stroke="gold"
                    stroke-width="1.5"
                  />
                  <path
                    d="M9 11H15M9 15H15"
                    stroke="gold"
                    stroke-width="1.5"
                    stroke-linecap="round"
                  />
                </svg>
                <div class="scrollable-text">
                  <a :href="item.Data" ref="media" :download="item.name">{{
                    item.name
                  }}</a>
                </div>
              </div>

              <div
                class="note_view_ui_close_btn"
                :class="{
                  toggle_close_btn_center_on_full_screen: Toggle_Reading_Form_Full_Screen,
                }"
              >
                <button
                  @click="CloseBtn($event, null, 'btn')"
                  class="btn close_note_view"
                  title="Close"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="32"
                    height="32"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  >
                    <path d="M18 6L6 18"></path>
                    <path d="M6 6l12 12"></path>
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </dialog>
    </div>
  </div>
  <!-- Wrapper End -->

  <!-- Error Section -->
  <div class="Critical_Error" :class="{ Critical_Error_Active: Toggle_Critical_Error }">
    <p ref="Critical_Error_Message">Something Went Wrong</p>
    <button @click="Toggle_Critical_Error = false" title="Hide">X</button>
  </div>

  <div
    class="combine_footer_Loaded_All_Notes"
    :class="{ active: Blur_Background_WhileOpening_Note }"
  >
    <!-- Miscellous features -->
    <div
      :class="{
        Load_All_Notes_Container_Show: All_Notes_Loaded_Message_Container_Element,
      }"
      class="Load_All_Notes_Container"
    >
      <h3 ref="All_Notes_loaded_Element">✨ All Notes Are Loaded! ✨</h3>
      <button
        @click="Hide_All_Notes_Loaded_Container"
        class="Load_All_Notes_Container_Close_Btn"
        title="Close"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <path d="M18 6L6 18" />
          <path d="M6 6l12 12" />
        </svg>
      </button>
    </div>

    <!-- Footer Features -->
    <div class="notes-actions">
      <div class="storage_capacity" title="Storage Capacity">
        <span class="used_capacity" ref="Used_Storage_Capacity_Element">
          <span>{{ Used_Storage_Capacity }}G / {{ Total_Storage_Capacity }}G</span>
        </span>
      </div>

      <button class="btn" @click="fetchAllNotes" title="Load More Notes">
        <svg
          v-show="!More_Notes_Are_Coming"
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <circle cx="6" cy="12" r="1" fill="currentColor" />
          <circle cx="12" cy="12" r="1" fill="currentColor" />
          <circle cx="18" cy="12" r="1" fill="currentColor" />
          <path d="M12 16v4m-3-3 3 3 3-3" stroke="currentColor" />
        </svg>
        <div class="Upload_Loader More_Notes_Loader" v-show="More_Notes_Are_Coming"></div>
      </button>
      <button class="btn sorting" @click="sorting" title="Sort Notes">
        <svg
          v-show="sort_order === 'asc'"
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <path d="M8 4l4-4 4 4" stroke="currentColor" fill="none" />
          <path d="M8 20l4 4 4-4" stroke="currentColor" fill="currentColor" />
        </svg>

        <svg
          v-show="sort_order === 'desc'"
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <path d="M8 4l4-4 4 4" stroke="currentColor" fill="currentColor" />
          <path d="M8 20l4 4 4-4" stroke="currentColor" fill="none" />
        </svg>
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, onUnmounted, computed } from "vue";
import Dexie from "dexie";
import { debounce } from "lodash";
// .................................... All Variables .........................................
let isAddBtnPressed = ref(false);
let CurrentlyWritingMessage = ref("");
let TextAreaElement = ref();
let Note_Createt_Close_btn = ref();
let DisableDoneBtnElement = ref();
let CurrentIndex = ref();
let SendNoteForView_Title = ref("");
let SendNoteForView_Message = ref("");
let No_Notes_Found_Message_Element = ref();
let Card = ref();
let Note_View_UI_Text_Element = ref();
let Note_heading_element = ref();
let Note_Making_UI_Element = ref();
let note_view_ui_element = ref();
let SendImageForView = ref([]);
let SendAudioForView = ref([]);
let SendVideoForView = ref([]);
let SendDocumentForView = ref([]);
let IsRoViewNoteOpen = ref(false);
let EditMode = ref(false);
let CurrentlyWritingTitle = ref("");
let focusOnInput = ref("");
let SearchInput_Element = ref();
let inputData = ref("");
let Loading = ref(true); // loading animation
let Loading_screen_end_then_animate_notes_card_con = ref(false); // loading animation
let images = ref([]);
let AudioStorage = ref([]);
let VideoStorage = ref([]);
let DocumentStorage = ref([]);
let Edit_Mode_images = ref([]);
let Edit_Mode_AudioStorage = ref([]);
let Edit_Mode_VideoStorage = ref([]);
let Edit_Mode_DocumentStorage = ref([]); // New storage for documents

let Note_Object = {
  title: "",
  userWrote: "",
  NotesDate: "",
  isCardGoingDeleted: false,
  IsLoading: true,
  id: null,
  Card_Title_Color: "",
  Card_Para_Color: "",
  Card_Footer_Color: "",
  Attachment_Used_Size: null,
  TimeStamp: null,
};
let SupportedMedia = ref([
  // Video formats
  "video/mp4",
  "video/webm",
  "video/ogg",
  "video/x-matroska",
  "video/avi",
  "video/mpeg",
  "video/quicktime",
  "video/x-msvideo",
  "video/x-flv",
  "video/x-ms-wmv",

  // Image formats
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/bmp",
  "image/webp",
  "image/svg+xml",
  "image/apng",
  "image/heic",
  "image/heif",

  // Audio formats
  "audio/mpeg",
  "audio/mp3",
  "audio/ogg",
  "audio/wav",
  "audio/flac",
  "audio/aac",
  "audio/x-m4a",
  "audio/webm",
  "audio/x-wav",
  "audio/x-aiff",
  "audio/x-ms-wma",

  // Text and document formats
  "text/plain",
  "text/html",
  "text/css",
  "application/javascript",
  "text/javascript",
  "application/json",
  "application/xml",
  "application/xhtml+xml",
  "text/markdown",
  "application/x-shellscript",
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
]);

let SupportedAudios = ref([
  "audio/mpeg",
  "audio/mp3",
  "audio/ogg",
  "audio/wav",
  "audio/flac",
  "audio/aac",
  "audio/x-m4a",
  "audio/webm",
  "audio/x-wav",
  "audio/x-aiff",
  "audio/x-ms-wma",
]);

let SupportedText = ref([
  "text/plain",
  "text/html",
  "text/css",
  "application/javascript",
  "text/javascript",
  "application/json",
  "text/markdown",
  "application/x-shellscript",
  "application/xml",
]);

/* ............................. Sounds ............................ */

/* import App_Load from "./assets/effects/App_Load.mp3"; */
import Create_Edit_Btn from "./assets/effects/Create_Edit_Btn.mp3";
import Delete_Note_Btn from "./assets/effects/Delete_Note_Btn.mp3";
import Done_Btn from "./assets/effects/Done_Btn.wav";
import View_Btn from "./assets/effects/View_Btn.mp3";
import Close_Btn from "./assets/effects/Close_Btn.mp3";

/* let App_Load_Sound = new Audio(App_Load); */
let Create_Edit_Btn_Sound = new Audio(Create_Edit_Btn);
let Delete_Note_Sound = new Audio(Delete_Note_Btn);
let Done_Btn_Sound = new Audio(Done_Btn);
let View_Btn_Sound = new Audio(View_Btn);
let Close_Btn_Sound = new Audio(Close_Btn);

/* ............................. Sounds ............................ */
let media = ref();
let temp_for_save_Create_Note_Text_if_available_parallelly = ref([]);
// Recording
let recordedChunks = ref([]);
let recordAudioButton = ref();
let recordVideoButton = ref();
let Front_Back_Camera = ref(false);
let videoPreview = ref();
let overlayElement = ref();
let mediaRecorder = "";
let currentStream = ""; // Store the MediaStream object
let i = 0;
let j = 0;
let Max_Accumulated_Attachments_Size_Buffer = ref(10 * 1024 * 1024);
let Max_Accumulated_Attachments_Size = ref(Max_Accumulated_Attachments_Size_Buffer.value);
/////
let Done_Mode_Toggle_Video_Preview = ref(false);
let Done_Mode_Toggle_Audio_Preview = ref(false);
let Done_Mode_Video_Preview_Element = ref();
let Done_Mode_Audio_Preview_Element = ref();
////
let Edit_Mode_Toggle_Video_Preview = ref(false);
let Edit_Mode_Toggle_Audio_Preview = ref(false);
let Edit_Mode_Video_Preview_Element = ref();
let Edit_Mode_Audio_Preview_Element = ref();
////
let Remove_Loading_Screen = ref(true);
let View_Note_Page_UI = ref();
let Newly_Created_Notes_Id_For_Backend_To_Avoid_Send_Them_During_pagination = ref([]);
let More_Notes_Are_Coming = ref(false);
let All_Notes_Loaded_Message_Container_Element = ref(false);
let Fetch_Notes_In_Parts = ref({ Start_From_Note: 1, Fetch_Till_Note: 5 });
let Toggle_Critical_Error = ref(false);
let Critical_Error_Message = ref();
let Save_The_Create_Notes_Max_Accu_Attachment_Capacity_While_Switching_To_Edit_Note = ref();
let controller = new AbortController(); //we pass controller as arg to fetch method and bakcned accept it as cancilation token parameter so useful when we reload or call conroller.abort then fetch will stop and throw error which will catched by catch block and http line will get closed and backend cancellation token will get expired and backend stop all operations where we setted that token.
let Media = ref({ Video_Stop_Duration: 21000, Audio_Stop_Duration: 180000 });
let Toggle_Reading_Form_Full_Screen = ref(false);
let Total_Storage_Capacity = ref(null);
let Used_Storage_Capacity = ref(null);
let Used_Storage_Capacity_Percentage = ref(null);
let Used_Storage_Capacity_Element = ref();
let sort_order = ref("desc");
let Blur_Background_WhileOpening_Note = ref(false);
const db = new Dexie("MyNotesDB");
const bg = ["#131313", "rgb(74 109 169)", "green", "#e2e2e2"];
const clr = ["#979797", "#dbdbdb", "white", "black"];
const colorIndex = ref(0);
let Alignment_index = ref(1);
let align_properties_arr = ref(["left", "center", "right"]);
let Is_Audio_Recording = ref(false);
let Is_Video_Recording = ref(false);
let toggle_delete_model = ref(false);
let Is_Sticky_Colorful_Card = ref(false);
let Attachment_Capacity_Violation_Toggle_Message = ref(false);
let Note_Attachment_Limit_Warning_Message = ref();
let All_Notes_loaded_Element = ref();
let disable_color_notes_switcher_btn = ref(true);
let Is_Front_Camera_In_Use = ref(false);
let Is_FlashLight_Supported = ref(false);
let Is_FlashLight_On = ref(false);
let flash_light_btn_element = ref();
let Current_Video_Stream_Track = ref();
let Is_Video_Mirroring = ref(false);
let supportedMime = ref("");
// All Methods.
// .........................................All The Functions .....................................................

function Toggle_Note_Card_Color_Mode() {
  let msg = "";
  Is_Sticky_Colorful_Card.value = !Is_Sticky_Colorful_Card.value;
  localStorage.setItem("Colorful_Notes", Is_Sticky_Colorful_Card.value);
  Is_Sticky_Colorful_Card.value
    ? (msg = "Colorful Notes Enabled - Your Next Notes Will Be Vibrant!")
    : (msg = "Standard Notes Active - New Notes Will Be Classic.");
  Show_Create_Edit_Model_Warning(msg, 5000);
}

const getShortText = (text) => {
  if (navigator.userAgent.toLowerCase().indexOf("firefox") > -1) {
    console.log("reached moz");
    if (!text) return;
    // Handle null/undefined cases
    else if (window.outerWidth <= 500) return text.substring(0, 100) + "...";
    else if (window.outerWidth > 500) return text.substring(0, 130) + "...";
  } else {
    console.log("reached else moz");
    if (!text) return;
    // Handle null/undefined cases
    else if (window.outerWidth <= 500) return text.substring(0, 110) + "...";
    else if (window.outerWidth > 500) return text.substring(0, 140) + "...";
  }
};

let Cancel_Operation = ref(false);

function abort_Controller() {
  if (Cancel_Operation.value) {
    console.log("aborted called");
    controller.abort();
    Cancel_Operation.value = false;
    resetController();
    return true;
  } else {
    return false;
  }
}

async function runAnimation(el) {
  if (abort_Controller()) return;
  console.log("calling animation method");
  await Lazy_Load_With_animation(el);
}

let vLoader = {
  async mounted(el, binding) {
    console.log("mounted");
    // Initially hide the media element
    el.style.transform = "scale(0)";
    // Set the source from the binding value
    if (abort_Controller()) return;
    await new Promise((resolve) => setTimeout(resolve, 500));
    if (abort_Controller()) return;
    el.src = binding.value;

    // Determine the appropriate event
    let eventName = "load";
    if (el.tagName === "VIDEO" || el.tagName === "AUDIO") {
      eventName = "loadeddata";
    }

    // there is an issue with IMG elements that if it is cached in borowser then it means it already completed and load method wont get called so if it is completed then running the animation method and for not completed then attach event listner to it and other media's.
    if (el.tagName === "IMG" && el.complete) {
      runAnimation(el);
    } else {
      el.addEventListener(eventName, () => runAnimation(el), { once: true });
    }
  },
  unmounted(el) {
    console.log("unmounting view ui media");
    el.src = "";
    el.removeEventListener("loadeddata", runAnimation);
    el.removeEventListener("load", runAnimation);
  },
};

async function Lazy_Load_With_animation(el) {
  if (abort_Controller()) return;
  console.log(
    el.previousElementSibling &&
      el.previousElementSibling.classList.contains("Upload_Loader_active_media")
  );
  if (
    el.previousElementSibling &&
    el.previousElementSibling.classList.contains("Upload_Loader_active_media")
  ) {
    el.previousElementSibling.style.display = "none";
  }
  await new Promise((resolve) => setTimeout(resolve, 10));
  if (abort_Controller()) return;
  el.style.transition = "transform 0.3s ease";
  el.style.transform = "scale(1)";
  /* enabling video overlay */
  if (el.tagName === "VIDEO")
    setTimeout(() => (el.nextSibling.style.display = "block"), 300);
}

async function CloseBtn(event, original = "note_making", location) {
  try {
    if (original == "note_making") {
      if (EditMode.value) return;
      toggle_delete_model.value = false;
      isAddBtnPressed.value = false;
      stopRecording();
      Close_Video_Audio_Preview();
      Close_Btn_Sound.play();
      console.log("making form");
    } else {
      console.log("UI form");
      // Revoke all object URLs for media previews
      if (
        SendImageForView.value.length > 0 ||
        SendVideoForView.value.length > 0 ||
        SendAudioForView.value.length > 0 ||
        SendDocumentForView.value.length > 0
      ) {
        console.log("UI with array");
        Cancel_Operation.value = true;
        await remove_elements_from_current_note_view_for_easy_close(event, location);
        IsRoViewNoteOpen.value = false;
        Close_Btn_Sound.play();
        setTimeout(async () => {
          await Stop_Media();
          await Cleaning_Link_from_ram();
        }, 100);
        console.log("All workers terminated and object URLs purged.");
      } else {
        console.log("UI without array");
        IsRoViewNoteOpen.value = false;
        Close_Btn_Sound.play();
      }
      if (document.body.classList.contains("disable_body_scroll_on_note_full_screen"))
        document.body.classList.remove("disable_body_scroll_on_note_full_screen");
    }
    Blur_Background_WhileOpening_Note.value = false;
    terminateAllWorkers();
    purgeObjectURLs();
  } catch (error) {
    console.log(error.message);
  }
}

async function remove_elements_from_current_note_view_for_easy_close(event, location) {
  console.log("remove_elements_from_current_note_view_for_easy_close");
  let media_elements =
    location === "btn"
      ? event.target.parentElement.parentElement.parentElement
      : event.target.children[0].children[0].children[3];

  media_elements
    .querySelectorAll(".Upload_Loader_active_media")
    .forEach((x) => (x.style.opacity = 0));
  media_elements.querySelectorAll(".video").forEach((x) => (x.style.opacity = 0));
  media_elements.querySelectorAll(".img").forEach((x) => (x.style.opacity = 0));
  media_elements.querySelectorAll(".audio").forEach((x) => (x.style.opacity = 0));
  media_elements.querySelectorAll(".document").forEach((x) => (x.style.opacity = 0));
}

async function Stop_Media() {
  console.log("Stop_Media");
  if (media.value) {
    media.value.forEach((x) => {
      console.log(x.tagName);
      if (x.tagName === "VIDEO" || x.tagName === "AUDIO") {
        if (!x.paused) {
          x.pause();
          x.currentTime = 0;
        }
        x.src = ""; // Clear source to release buffer
        x.load(); // Release resources
      } else if (x.tagName === "IMG") {
        x.src = "";
      } else if (x.tagName === "A") {
        x.href = "";
      }
      x.remove();
      setTimeout(() => console.log(x), 1000);
    });
  }
  console.log("All Media Removed", media);
  media.value.splice(0, media.value.length);
}

async function Cleaning_Link_from_ram() {
  console.log("Cleaning_Link_from_ram");

  if (SendImageForView.value.length > 0) {
    SendImageForView.value.forEach((img) => {
      if (img.Data.startsWith("blob:")) {
        URL.revokeObjectURL(img.Data);
      }
      img.Data = "";
    });
  }

  if (SendVideoForView.value.length > 0) {
    SendVideoForView.value.forEach((vid) => {
      if (vid.Data.startsWith("blob:")) {
        URL.revokeObjectURL(vid.Data);
      }
      vid.Data = "";
    });
  }

  if (SendAudioForView.value.length > 0) {
    SendAudioForView.value.forEach((audio) => {
      if (audio.Data.startsWith("blob:")) {
        URL.revokeObjectURL(audio.Data);
      }
      audio.Data = "";
    });
  }

  if (SendDocumentForView.value.length > 0) {
    SendDocumentForView.value.forEach((doc) => {
      if (doc.Data.startsWith("blob:")) {
        URL.revokeObjectURL(doc.Data);
      }
      doc.Data = "";
    });
  }

  if (Decompressed_Media.value && Decompressed_Media.value.ImageFile.length > 0) {
    Decompressed_Media.value.ImageFile.forEach((img) => {
      if (img.Data.startsWith("blob:")) {
        URL.revokeObjectURL(img.Data);
      }
      img.Data = "";
    });
  }

  if (Decompressed_Media.value && Decompressed_Media.value.VideoFiles.length > 0) {
    Decompressed_Media.value.VideoFiles.forEach((vid) => {
      if (vid.Data.startsWith("blob:")) {
        URL.revokeObjectURL(vid.Data);
      }
      vid.Data = "";
    });
  }

  if (Decompressed_Media.value && Decompressed_Media.value.AudioFiles.length > 0) {
    Decompressed_Media.value.AudioFiles.forEach((audio) => {
      if (audio.Data.startsWith("blob:")) {
        URL.revokeObjectURL(audio.Data);
      }
      audio.Data = "";
    });
  }

  if (Decompressed_Media.value && Decompressed_Media.value.DocumentFiles.length > 0) {
    Decompressed_Media.value.DocumentFiles.forEach((doc) => {
      if (doc.Data.startsWith("blob:")) {
        URL.revokeObjectURL(doc.Data);
      }
      doc.Data = "";
    });
  }

  // Clear arrays using splice
  console.log("Cleaning_Arrays_from_ram");
  SendImageForView.value.splice(0, SendImageForView.value.length);
  SendVideoForView.value.splice(0, SendVideoForView.value.length);
  SendAudioForView.value.splice(0, SendAudioForView.value.length);
  SendDocumentForView.value.splice(0, SendDocumentForView.value.length);

  if (Decompressed_Media.value) {
    Decompressed_Media.value.ImageFile.splice(
      0,
      Decompressed_Media.value.ImageFile.length
    );
    Decompressed_Media.value.VideoFiles.splice(
      0,
      Decompressed_Media.value.VideoFiles.length
    );
    Decompressed_Media.value.AudioFiles.splice(
      0,
      Decompressed_Media.value.AudioFiles.length
    );
    Decompressed_Media.value.DocumentFiles.splice(
      0,
      Decompressed_Media.value.DocumentFiles.length
    );
    Decompressed_Media.value = null;
  }
  nukeMediaElements();
  Cancel_Operation.value = false;
  resetController();
}

// Add to Cleaning_Link_from_ram()
function nukeMediaElements() {
  const zombieElements = [
    ...document.querySelectorAll("video:not(.active)"),
    ...document.querySelectorAll("audio:not(.active)"),
    ...document.querySelectorAll("img:not(.active)"),
  ];

  zombieElements.forEach((el) => {
    console.log("nuke method ", el);
    el.pause();
    el.src = "";
    el.srcObject = null;
    el.removeAttribute("src");
    el.load();
  });
  // Force garbage collection (Chrome only)
  if (window.gc) window.gc();
}

function Toggle_Note_Full_Screen() {
  Toggle_Reading_Form_Full_Screen.value = !Toggle_Reading_Form_Full_Screen.value;
  document.body.classList.toggle("disable_body_scroll_on_note_full_screen");
}

function Remove_Video_Overlay(event) {
  event.target.classList.add("hide_video_overlay");
  setTimeout(() => event.target.remove(), 300);
  event.target.previousElementSibling.play();
}

db.version(1).stores({
  notes: "id, note, createdAt, updatedAt",
  media: "id, blob, createdAt, updatedAt",
});

const refreshKey = ref(new Date().toISOString());

// Call this function whenever you open a note to force a re-render.
function updateRefreshKey() {
  refreshKey.value = new Date().toISOString();
}

const boxStyle = computed(() => ({
  backgroundColor: bg[colorIndex.value],
  color: clr[colorIndex.value] + "!important",
}));

const changeColor = () => {
  colorIndex.value = (colorIndex.value + 1) % bg.length;
  console.log(colorIndex, " --> ", clr[colorIndex.value]);
};

const buttonStyle = computed(() => ({
  borderColor: getBorderColor(),
}));

const getBorderColor = () => {
  const borderColor = new Array(4).fill("transparent");
  for (let i = 0; i <= colorIndex.value; i++) {
    borderColor[i] = "yellow";
  }
  return borderColor.join(" ");
};

function align_Note_View_UI_Text() {
  try {
    Alignment_index.value =
      (Alignment_index.value + 1) % align_properties_arr.value.length;
    change_text_alignment();
    localStorage.setItem("align_text", Alignment_index.value);
  } catch (error) {
    console.log(error.message);
  }
}

function change_text_alignment() {
  try {
    Note_View_UI_Text_Element.value.style.textAlign =
      align_properties_arr.value[Alignment_index.value];
  } catch (error) {
    console.log(error.message);
  }
}

/* function Toggle_Note_Form_Full_Screen() {
  setTimeout(() => {
    AdjustCameraScreenSize();
  }, 10);
  NoteWriter_Form_Full_Screen.value = !NoteWriter_Form_Full_Screen.value;
} */

function Turn_Off_Loading_Screen() {
  try {
    if (Loading.value && Remove_Loading_Screen.value) {
      setTimeout(() => {
        Loading.value = false;
      }, 500);
      /////
      setTimeout(
        () => (Loading_screen_end_then_animate_notes_card_con.value = true),
        800
      );
      setTimeout(() => (Remove_Loading_Screen.value = false), 1000);
    }
  } catch (error) {
    console.log(error.message);
  }
}

function Hide_All_Notes_Loaded_Container() {
  try {
    All_Notes_Loaded_Message_Container_Element.value = false;
    setTimeout(() => {
      All_Notes_loaded_Element.value.parentElement.style.height = 0;
      All_Notes_loaded_Element.value.parentElement.parentElement.style.rowGap = "0";
    }, 300);
  } catch (error) {
    console.log(error.message);
  }
}

function All_Notes_Loaded() {
  try {
    All_Notes_Loaded_Message_Container_Element.value = false;
    setTimeout(() => {
      More_Notes_Are_Coming.value = false;
      All_Notes_loaded_Element.value.parentElement.style.height = "unset"; // before message show we need to make its div height to normal again.
      All_Notes_loaded_Element.value.parentElement.parentElement.style.rowGap = ".5rem";
      All_Notes_Loaded_Message_Container_Element.value = true;
    }, 1000);
    window.removeEventListener("scroll", debouncedScroll);
    return;
  } catch (error) {
    console.log(error.message);
  }
}

function Show_Critical_Error(message) {
  try {
    Toggle_Critical_Error.value = true;
    setTimeout(() => {
      Critical_Error_Message.value.textContent = message;
    }, 100);
  } catch (error) {
    console.log(error.message);
  }
}

function resetController() {
  try {
    controller = new AbortController();
  } catch (error) {
    console.log(error.message);
  }
}

function storage_capacity_checker() {
  try {
    if (!navigator.storage || !navigator.storage.estimate) {
      console.log("Storage API not supported in this browser.");
      Show_Critical_Error("Storage API not supported in this browser.");
      return;
    }

    navigator.storage.estimate().then((estimate) => {
      if (!estimate.usage || !estimate.quota) {
        console.log("Unable to retrieve storage estimate.");
        Show_Critical_Error("Unable to retrieve storage estimate.");
        return;
      }

      Used_Storage_Capacity.value = (estimate.usage / 1024 ** 3).toFixed(1); // Convert bytes to GB
      Total_Storage_Capacity.value = (estimate.quota / 1024 ** 3).toFixed(1); // Convert bytes to GB
      Used_Storage_Capacity_Percentage.value = (
        (estimate.usage / estimate.quota) *
        100
      ).toFixed(2); // Calculate percentage

      if (Used_Storage_Capacity_Element.value) {
        Used_Storage_Capacity_Element.value.style.width =
          Used_Storage_Capacity_Percentage.value + "%";
      }

      console.log(`Used: ${Used_Storage_Capacity.value} GB`);
      console.log(`Total: ${Total_Storage_Capacity.value} GB`);
      console.log(`Used Capacity: ${Used_Storage_Capacity_Percentage.value}%`);
    });
  } catch (error) {
    console.log(error.message);
  }
}

function ShowErrors(error) {
  try {
    if (error.name === "QuotaExceededError") {
      // Inform the user that storage is full.
      Show_Critical_Error(
        "Storage quota exceeded. Please free up some space or try again later."
      );
    } else if (error.name === "ConstraintError") {
      // Handle duplicate key error.
      Show_Critical_Error("A note with this identifier already exists.");
    } else if (error.name === "AbortError") {
      // Handle a transaction abort.
      Show_Critical_Error("Operation aborted. Please try again.");
    } else {
      // General error handling.
      Show_Critical_Error("Something Went Wrong! Reload The Page.");
    }
    controller.abort();
  } catch (error) {
    console.log(error.message);
  }
}

function Scroll_Reached_Bottom() {
  try {
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const windowHeight = window.innerHeight;
    const docHeight = document.documentElement.scrollHeight; // More reliable

    if (windowHeight + scrollTop >= docHeight - 10) {
      // Add small buffer
      fetchAllNotes();
    }
  } catch (error) {
    console.log(error.message);
  }
}

let debounceTimeout;
function debouncedScroll() {
  try {
    clearTimeout(debounceTimeout);
    debounceTimeout = setTimeout(Scroll_Reached_Bottom, 150);
  } catch (error) {
    console.log(error.message);
  }
}

const workerRegistry = new Set();

function terminateAllWorkers() {
  const terminationPromises = [];

  workerRegistry.forEach((worker) => {
    console.log("Terminating worker:", worker);
    worker.postMessage({ command: "SUICIDE" });

    const terminationPromise = new Promise((resolve, reject) => {
      worker.onmessage = function (e) {
        if (e.data.status === "SUICIDE_CONFIRMED") {
          worker.terminate();
          workerRegistry.delete(worker);
          console.log("Worker terminated successfully.");
          resolve();
        }
      };

      worker.onerror = function (error) {
        console.error("Error terminating worker:", error.message);
        worker.terminate();
        workerRegistry.delete(worker);
        reject(error);
      };
    });

    terminationPromises.push(terminationPromise);
  });

  Promise.all(terminationPromises)
    .then(() => {
      workerRegistry.clear();
      console.log("All workers terminated and registry cleared.");
    })
    .catch((error) => {
      console.error("Error terminating workers:", error.message);
    });
}

// --- Revised CreateWorker() ---
// This function now returns a promise that resolves when the worker has processed the note.
function CreateWorker(compressedNote, Is_Note) {
  return new Promise((resolve, reject) => {
    let newWorker;
    try {
      resetController();
      newWorker = new Worker(new URL("./components/worker.js", import.meta.url), {
        type: "module",
      });
      workerRegistry.add(newWorker);

      console.log("Main sending compressed note to worker:", compressedNote);
      newWorker.postMessage({ compressedNote });

      newWorker.onmessage = function (e) {
        if (e.data.error) {
          console.log("Worker sent error:", e.data.error);
          // Reject the promise if the worker encountered an error.
          newWorker.terminate();
          reject(e.data.error);
          Show_Critical_Error("Notes Decompression Failed! Reload Page or Browser.");
          More_Notes_Are_Coming.value = false;
          Loading.value = false;
          controller.abort();
        } else if (e.data.note) {
          console.log("Worker processed data:", e.data.note);
          e.data.note.IsLoading = false;
          Is_Note ? data.value.push(e.data.note) : null;
          newWorker.terminate();
          resolve(e.data.note);
        }
        compressedNote = null;
      };
    } catch (error) {
      newWorker.terminate();
      compressedNote = null;
      reject(error);
      Show_Critical_Error("Notes Decompression Failed! Reload Page or Browser.");
      controller.abort();
    }
  });
}

async function SeedNote_On_first_time_app_load() {
  try {
    let currentDate = new Date();
    let formattedDate = currentDate.toLocaleDateString();

    let Main_Sow_Case_Note = {
      title: "Demo Note",
      userWrote:
        "Hello There, Welcome To Simple Colorful Notes Making Web App. This App Allows You To Create, Edit, View (Tap On Note) And Delete Notes. You Can Also Attach Images, Videos, Audio Files And Documents To Your Notes. The App Supports Various Media Formats And Provides A User-Friendly Interface For Managing Your Notes. Below is a Empty Files Demo. Enjoy Using Notes!",
      NotesDate: formattedDate,
      isCardGoingDeleted: false,
      IsLoading: true,
      id: 10102,
      Card_Title_Color: "rgb(68 68 68)",
      Card_Para_Color: "rgb(46 46 46)",
      Card_Footer_Color: "rgb(68 68 68)",
      Attachment_Used_Size: Max_Accumulated_Attachments_Size.value,
      TimeStamp: new Date().toISOString(),
    };

    const demoSeeded = localStorage.getItem("demoNoteSeeded");

    // Count the current notes.
    const count = await db.notes.count();

    // Only seed if there are no notes AND we haven't seeded before.
    if (count === 0 && !demoSeeded) {
      data.value.push(Main_Sow_Case_Note);
      await Post_Note(Main_Sow_Case_Note, null);
      localStorage.setItem("demoNoteSeeded", "true");
    } else {
      return;
    }
  } catch (error) {
    console.log(error.message);
  }
}

function reset_searchbar() {
  try {
    inputData.value = "";
    SearchBtnLogic();
  } catch (error) {
    console.log(error.message);
  }
}

function sorting() {
  try {
    reset_searchbar();
    sort_order.value = sort_order.value === "asc" ? "desc" : "asc";
    localStorage.setItem("sort_order", sort_order.value);
    PersistSort();
  } catch (error) {
    console.log(error.message);
  }
}

function PersistSort() {
  try {
    data.value = [...data.value].sort((a, b) => {
      if (sort_order.value === "asc") {
        return new Date(a.TimeStamp) - new Date(b.TimeStamp);
      } else {
        return new Date(b.TimeStamp) - new Date(a.TimeStamp);
      }
    });
  } catch (error) {
    console.log(error.message);
  }
}

async function fetchAllNotes() {
  try {
    // Reset any existing controller state.
    resetController();

    reset_searchbar();

    // Build an array of excluded IDs if we are not on the very first batch.
    let excludedIds = [];
    if (
      Newly_Created_Notes_Id_For_Backend_To_Avoid_Send_Them_During_pagination.value
        .length > 0
    ) {
      excludedIds =
        Newly_Created_Notes_Id_For_Backend_To_Avoid_Send_Them_During_pagination.value;
    }

    // Determine the offset and limit for the query.
    // Here, we assume that:
    const startIndex =
      (Fetch_Notes_In_Parts.value.Start_From_Note - 1) *
      Fetch_Notes_In_Parts.value.Fetch_Till_Note;
    const limitCount = Fetch_Notes_In_Parts.value.Fetch_Till_Note;

    console.log("start index:", startIndex, "limit:", limitCount);
    console.log("excluded ids:", excludedIds);

    let query = db.notes.orderBy("createdAt").reverse();

    if (excludedIds.length > 0) {
      query = query.filter((note) => !excludedIds.includes(note.id));
    }

    let compressed_notes = await query.offset(startIndex).limit(limitCount).toArray();

    if (Fetch_Notes_In_Parts.value.Start_From_Note !== 1) {
      More_Notes_Are_Coming.value = true;
    }

    console.log("More notes Loading Icon:", More_Notes_Are_Coming.value);

    // If no notes are returned, then all notes are loaded.
    if (compressed_notes.length === 0) {
      if (Fetch_Notes_In_Parts.value.Start_From_Note !== 1) {
        All_Notes_Loaded();
      }
      Turn_Off_Loading_Screen();
      return;
    }

    Fetch_Notes_In_Parts.value.Start_From_Note++;

    let workerPromises = compressed_notes.map((compressed_note) => {
      console.log("Sending note to worker:", compressed_note.note);
      return CreateWorker(compressed_note.note, true);
    });

    // Wait until all workers have finished processing and pushed their results to the UI.
    await Promise.all(workerPromises);

    PersistSort();

    More_Notes_Are_Coming.value = false;

    if (Fetch_Notes_In_Parts.value.Start_From_Note == 2) {
      Turn_Off_Loading_Screen();
    }
    query = null;
    compressed_notes = null;
    workerPromises = null;
  } catch (error) {
    console.error(error.message);
    ShowErrors(error);
    More_Notes_Are_Coming.value = false;
    Loading.value = false;
  }
}

async function DeleteNote(Delete_id) {
  try {
    resetController();
    await db.transaction("rw", db.notes, db.media, async () => {
      await db.notes.delete(Delete_id);
      await db.media.delete(Delete_id);
      Delete_Note_Sound.play();
    });
    console.log("Notes Deleted Successfully Of Id: " + Delete_id);
    storage_capacity_checker();
  } catch (error) {
    console.log(error.message);
    ShowErrors(error);
  }
}

function Reset_Media_Object() {
  media_object.value.id = null;
  media_object.value.ImageFile.splice(0, media_object.value.ImageFile.length);
  media_object.value.VideoFiles.splice(0, media_object.value.VideoFiles.length);
  media_object.value.AudioFiles.splice(0, media_object.value.AudioFiles.length);
  media_object.value.DocumentFiles.splice(0, media_object.value.DocumentFiles.length);
  //  media_object.value = null;
}

async function Post_Note(note, media) {
  try {
    resetController();
    console.log("[Frontend] Preparing to compress the note...");

    // Ensure the note is valid before proceeding
    console.log(note);

    if (!note) {
      console.error("[Frontend] Invalid note data.");
      return;
    }

    // Compress the note using the Web Worker
    let newNote = null;
    let compressedNote = null;
    let new_Note_Media = null;
    let compressedMedia = null;

    compressedNote = await compressNoteInWorker(note);
    console.log("[Frontend] Note compressed successfully.", compressedNote);

    newNote = {
      id: note.id,
      note: compressedNote,
      createdAt: new Date(),
      updatedAt: null,
    };

    if (
      media &&
      (media.ImageFile.length > 0 ||
        media.VideoFiles.length > 0 ||
        media.AudioFiles.length > 0 ||
        media.DocumentFiles.length > 0)
    ) {
      compressedMedia = await compressNoteInWorker(media);

      new_Note_Media = {
        id: note.id,
        blob: compressedMedia,
        createdAt: new Date(),
        updatedAt: null,
      };
    }
    await db.transaction("rw", db.notes, db.media, async () => {
      await db.notes.add(newNote);
      if (new_Note_Media) await db.media.add(new_Note_Media);
      data.value[data.value.findIndex((n) => n.id == note.id)].IsLoading = false;
    });

    Newly_Created_Notes_Id_For_Backend_To_Avoid_Send_Them_During_pagination.value.push(
      note.id
    );
    Reset_Media_Object();
    newNote = null;
    compressedNote = null;
    new_Note_Media = null;
    compressedMedia = null;
    note = null;
    media = null;
    terminateAllWorkers();
    purgeObjectURLs();
    console.log("All workers terminated and object URLs purged.");
    storage_capacity_checker();
  } catch (error) {
    console.error("[Frontend] Error in Post_And_Update_Notes:", error.message);
    // Optionally, display an error message to the user
    ShowErrors(error);
  }
}

async function Update_Note(note, media) {
  try {
    resetController();
    console.log("[Frontend] Preparing to compress the note...");

    // Ensure the note is valid before proceeding
    console.log(note);

    if (!note) {
      console.error("[Frontend] Invalid note data.");
      return;
    }

    let compressedNote = null;
    let updatedNote = null;
    let compressedMedia = null;
    let updatedMedia = null;
    // Compress the note using the Web Worker
    compressedNote = await compressNoteInWorker(note);
    console.log("[Frontend] Note compressed successfully.", compressedNote);

    updatedNote = {
      note: compressedNote,
      updatedAt: new Date(),
    };

    /*     if (
      media.ImageFile.length > 0 ||
      media.VideoFiles.length > 0 ||
      media.AudioFiles.length > 0 ||
      media.DocumentFiles.length > 0
    ) { */
    compressedMedia = await compressNoteInWorker(media);
    updatedMedia = {
      blob: compressedMedia,
      updatedAt: new Date(),
    };
    /* } */

    await db.transaction("rw", db.notes, db.media, async () => {
      await db.notes.update(note.id, updatedNote);
      if (updatedMedia) {
        await db.media.update(note.id, updatedMedia);
        console.log("updating the media");
      }
      note.IsLoading = false;
    });
    Reset_Media_Object();
    compressedNote = null;
    updatedNote = null;
    compressedMedia = null;
    updatedMedia = null;
    note = null;
    media = null;
    terminateAllWorkers();
    purgeObjectURLs();
    console.log("All workers terminated and object URLs purged.");
    storage_capacity_checker();
  } catch (error) {
    console.error("[Frontend] Error in Post_And_Update_Notes:", error.message);
    // Optionally, display an error message to the user
    ShowErrors(error);
  }
}

function compressNoteInWorker(note) {
  let worker;
  resetController();
  console.log("Sending note to worker ", note);

  try {
    worker = new Worker(new URL("./components/compression.worker.js", import.meta.url), {
      type: "module",
    });
    workerRegistry.add(worker);
    return new Promise((resolve, reject) => {
      worker.onmessage = (event) => {
        if (event.data.error) {
          console.error("[Frontend] Worker Compression Error:", event.data.error);
          worker.terminate(); // Clean up worker after task completion
          reject(event.data.error);
          Show_Critical_Error("Notes Compression Failed! Reload Page or Browser.");
          controller.abort();
        } else {
          console.log("Worker_finished Product ", event.data.compressedNote);
          worker.terminate(); // Clean up worker after task completion
          resolve(event.data.compressedNote); // Compression successful
        }
        note = null;
      };

      worker.onerror = (error) => {
        console.error("[Frontend] Error in Web Worker:", error.message);
        reject(new Error(error.message)); // Handle generic worker errors
        Show_Critical_Error("Notes Compression Failed! Reload Page or Browser.");
        worker.terminate();
        controller.abort();
        note = null;
      };

      // Send the note data to the worker for compression
      worker.postMessage({ noteString: JSON.stringify(note) });
      note = null;
    });
  } catch (error) {
    console.log(error.message);
    Show_Critical_Error("Notes Compression Failed! Reload Page or Browser.");
    worker.terminate();
    controller.abort();
  }
}

/* --------------------------- */
// Toggles camera options visibility
let originalStream = null;
let canvasStream = null;
let offscreenVideo = null;
let canvas = null;
let ctx = null;
// Helper: Get a supported MIME type for the given recording type.
function getSupportedMimeType(type) {
  try {
    let mimeTypes = [];

    if (type === "audio") {
      mimeTypes = [
        "audio/webm; codecs=opus", // Best for modern audio
        "audio/webm; codecs=pcm", // Raw PCM (high quality)
        "audio/mp4; codecs=aac", // AAC for MP4 support
        "audio/mpeg", // MP3 format (broader support)
        "audio/ogg; codecs=opus", // Opus in OGG
        "audio/ogg; codecs=vorbis", // Vorbis in OGG
        "audio/webm", // Generic WebM
        "audio/wav", // WAV (fallback)
      ];
    } else if (type === "video") {
      mimeTypes = [
        "video/webm; codecs=vp9,opus", // Best modern choice (VP9 + Opus)
        "video/webm; codecs=vp8,opus", // VP8 + Opus
        "video/mp4; codecs=avc1.640029,mp4a.40.2", // H.264 + AAC (MP4)
        "video/mp4; codecs=avc1.42E01E,mp4a.40.2", // H.264 Baseline + AAC
        "video/ogg; codecs=theora,vorbis", // Theora + Vorbis (OGG)
        "video/webm", // Generic WebM (fallback)
      ];
    }

    for (let mime of mimeTypes) {
      if (MediaRecorder.isTypeSupported(mime)) {
        console.log("Supported MIME type found:", mime);
        return mime;
      }
    }
    console.warn("No supported MIME type found for", type);
    Show_Create_Edit_Model_Warning("No supported MIME type found for " + type, 2000);
    return "";
  } catch (error) {
    console.log(error.message);
  }
}

function VideoRec() {
  try {
    if (!Is_Video_Recording.value) {
      Front_Back_Camera.value = !Front_Back_Camera.value;
    } else {
      stopRecording();
    }
  } catch (error) {
    console.log(error.message);
  }
}

// Camera option buttons
function FrontCamVideoRec() {
  try {
    startVideoRecording("user");
    Front_Back_Camera.value = !Front_Back_Camera.value;
    Close_Video_Audio_Preview();
  } catch (error) {
    console.log(error.message);
  }
}

function BackCamVideoRec() {
  try {
    startVideoRecording("environment");
    Front_Back_Camera.value = !Front_Back_Camera.value;
    Close_Video_Audio_Preview();
  } catch (error) {
    console.log(error.message);
  }
}

// Audio recording button
function AudioRec() {
  try {
    if (!Is_Audio_Recording.value) {
      Front_Back_Camera.value = false;
      Close_Video_Audio_Preview();
      startAudioRecording();
    } else {
      stopRecording();
    }
  } catch (error) {
    console.log(error.message);
  }
}

// Start video recording
async function startVideoRecording(facingMode) {
  try {
    let Camera_Devices = ref([]);

    if (currentStream) stopStream(currentStream);
    const constraints = {
      video: { facingMode },
      audio: true,
    };

    // Get the original stream
    originalStream = await navigator.mediaDevices.getUserMedia(constraints);
    currentStream = originalStream; // keep a reference
    const All_Devices = await navigator.mediaDevices.enumerateDevices();

    if (All_Devices.length === 0) {
      Show_Create_Edit_Model_Warning("No Camera Found!", 2000);
      stopRecording();
      return;
    }

    Camera_Devices.value = All_Devices.filter((device) => device.kind === "videoinput");

    if (Camera_Devices.value.length === 0) {
      Show_Create_Edit_Model_Warning("No Camera Found!", 2000);
      stopRecording();
      return;
    }

    let Currently_Using_Camera_Device_ID = originalStream
      .getVideoTracks()[0]
      .getSettings().deviceId;

    let frontCameraDetected = false;
    let backCameraDetected = false;

    Camera_Devices.value.forEach((device) => {
      const label = device.label.toLowerCase();
      if (label.includes("back") || label.includes("rear")) {
        console.log("Back Camera Detected:", device.deviceId);
        backCameraDetected = true;
        if (device.deviceId === Currently_Using_Camera_Device_ID) {
          Is_Front_Camera_In_Use.value = false;
        }
      } else if (label.includes("front") || label.includes("integrated")) {
        console.log("Front Camera Detected:", device.deviceId);
        frontCameraDetected = true;
        if (device.deviceId === Currently_Using_Camera_Device_ID) {
          Is_Front_Camera_In_Use.value = true;
        }
      }
    });

    // Fallback if labels are not clear
    if (!frontCameraDetected && !backCameraDetected) {
      Camera_Devices.value.forEach((device) => {
        if (device.deviceId === Currently_Using_Camera_Device_ID) {
          Is_Front_Camera_In_Use.value = facingMode === "user";
        }
      });
    }

    Current_Video_Stream_Track.value = originalStream.getVideoTracks()[0];
    if (!Current_Video_Stream_Track.value) {
      console.log("No Video track found");
      return;
    }

    // Check torch support via getCapabilities().
    const capabilities = Current_Video_Stream_Track.value.getCapabilities();
    if (!capabilities) {
      console.log("No capabilities found");
      // return;
    }

    if (!("torch" in capabilities)) {
      console.log("Torch is not supported");
      Is_FlashLight_Supported.value = false;
      //flash_light_btn_element.value.disabled = true;
      Is_FlashLight_On.value = false;
      Show_Create_Edit_Model_Warning(
        `Device ${
          Is_Front_Camera_In_Use.value ? "Front Camera" : "Back Camera"
        } Does Not Support Flash Light!`,
        2000
      );
    } else {
      console.log("Torch is supported");
      Is_FlashLight_Supported.value = true;
      //flash_light_btn_element.value.disabled = false;
    }

    Toggle_Torch();

    // Set mirroring flag
    Is_Video_Mirroring.value = !!Is_Front_Camera_In_Use.value;

    // If using front camera, mirror the stream
    if (Is_Video_Mirroring.value) {
      // Create an offscreen video element
      offscreenVideo = document.createElement("video");
      offscreenVideo.style.display = "none"; // hide it
      offscreenVideo.srcObject = originalStream;
      offscreenVideo.muted = true;

      // Wait for metadata to load to get video dimensions
      await new Promise((resolve, reject) => {
        offscreenVideo.onloadedmetadata = () => {
          resolve();
        };
        offscreenVideo.onerror = reject;
      });

      // Start playing the offscreen video
      await offscreenVideo.play().catch((err) => {
        console.error("Offscreen video play failed:", err);
      });

      // Create a canvas matching video dimensions
      canvas = document.createElement("canvas");
      canvas.width = offscreenVideo.videoWidth;
      canvas.height = offscreenVideo.videoHeight;
      ctx = canvas.getContext("2d");

      // Draw frames continuously with horizontal flip
      // eslint-disable-next-line no-unused-vars
      let animationFrameId;
      function drawFrame() {
        if (ctx) {
          ctx.save();
          ctx.scale(-1, 1); // horizontal flip
          ctx.drawImage(offscreenVideo, -canvas.width, 0, canvas.width, canvas.height);
          ctx.restore();
          animationFrameId = requestAnimationFrame(drawFrame);
        }
      }
      drawFrame();

      // Capture the canvas stream (use same FPS as video, if known)
      canvasStream = canvas.captureStream(30);
      // Copy audio tracks from the original stream to the canvas stream
      originalStream.getAudioTracks().forEach((track) => {
        canvasStream.addTrack(track);
      });
      // Now use the canvas stream for preview and recording
      currentStream = canvasStream;
      console.log("Using mirrored (canvas) stream for recording.");
    }

    // Set preview
    videoPreview.value.style.display = "block";
    AdjustCameraScreenSize();
    videoPreview.value.srcObject = currentStream;

    // Start recording using MediaRecorder
    startMediaRecorder("video");
    Is_Video_Recording.value = true;
    recordAudioButton.value.disabled = true;
  } catch (error) {
    console.error("Error accessing camera:", error);
  }
}

function Toggle_Torch() {
  try {
    if (Current_Video_Stream_Track.value) {
      if (Is_FlashLight_Supported.value) {
        Current_Video_Stream_Track.value.applyConstraints({
          advanced: [{ torch: Is_FlashLight_On.value }],
        });
      } else {
        Show_Create_Edit_Model_Warning(
          `Device ${
            Is_Front_Camera_In_Use.value ? "Front Camera" : "Back Camera"
          } Does Not Support Flash Light!`,
          2000
        );
      }
    } else {
      Show_Create_Edit_Model_Warning("Please Start Video Recording First!", 2000);
    }
  } catch (error) {
    console.log(error.message);
  }
}

// Start audio recording
async function startAudioRecording() {
  if (currentStream) stopStream(currentStream);

  const constraints = { audio: true };

  try {
    currentStream = await navigator.mediaDevices.getUserMedia(constraints);
    overlayElement.value.style.display = "flex";
    startMediaRecorder("audio");
    Is_Audio_Recording.value = true;
    recordVideoButton.value.disabled = true;
  } catch (error) {
    console.error("Error accessing microphone:", error);
  }
}

// Start MediaRecorder with robust MIME type checking
function startMediaRecorder(type) {
  try {
    console.log(Max_Accumulated_Attachments_Size.value);

    if (
      Max_Accumulated_Attachments_Size.value > 0 &&
      Max_Accumulated_Attachments_Size.value <=
        Max_Accumulated_Attachments_Size_Buffer.value
    ) {
      DisableDoneBtnElement.value.disabled = true;
      DisableDoneBtnElement.value.style.backgroundColor = "#d9ae38";

      // Get a supported MIME type based on the recording type.
      supportedMime.value = getSupportedMimeType(type);
      if (!supportedMime.value) {
        console.error("No supported MIME type found for", type);
        Show_Create_Edit_Model_Warning(
          `Recording failed: no supported MIME type for ${type}`,
          2000
        );
        return;
      }

      // Initialize MediaRecorder with the supported MIME type.
      mediaRecorder = new MediaRecorder(currentStream, {
        mimeType: supportedMime.value,
      });
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) recordedChunks.value.push(event.data);
      };
      mediaRecorder.onstop = () => saveRecording(type);
      mediaRecorder.start();

      mediaRecorder.onerror = (e) =>
        Show_Critical_Error("Failed, Recording Not Started ", e);
      // Automatically stop recording after the time limit
      let timeLimit =
        type === "video"
          ? Media.value.Video_Stop_Duration
          : Media.value.Audio_Stop_Duration; // 20 sec for video, 5 min for audio
      console.log("--> recccc " + timeLimit);
      console.log("--> stateeee " + mediaRecorder.state);

      let timeOut = null;
      timeOut = setTimeout(() => {
        if (mediaRecorder.state === "recording") {
          stopRecording(timeOut);
        }
      }, timeLimit);
    } else {
      stopRecording();
      Show_Create_Edit_Model_Warning(
        `Failed, Clear Previous Attachments And Recordings!`,
        3000
      );
      return;
    }
    //////
  } catch (error) {
    console.log(error.message);
  }
}

// Stop recording
function stopRecording(timeOut) {
  try {
    console.log("Stopping recording...");
    if (timeOut) clearTimeout(timeOut);
    if (mediaRecorder) mediaRecorder.stop();
    //mediaRecorder = null;
    if (currentStream) stopStream(currentStream);
    if (originalStream) stopStream(currentStream);
    if (canvasStream) stopStream(currentStream);
    if (Current_Video_Stream_Track.value) {
      Current_Video_Stream_Track.value.stop();
      Current_Video_Stream_Track.value = null;
    }
    Is_Video_Recording.value = false;
    Is_Audio_Recording.value = false;
    recordVideoButton.value.disabled = false;
    recordAudioButton.value.disabled = false;
    DisableDoneBtnElement.value.disabled = false;
    DisableDoneBtnElement.value.style.backgroundColor = "#d9ae38";
    overlayElement.value.style.display = "none";
  } catch (error) {
    console.log(error.message);
  }
}

// Stop stream tracks
function stopStream(stream) {
  try {
    stream.getTracks().forEach((track) => {
      track.stop();
      track.dispatchEvent(new Event("ended"));
      track.enabled = false;
      track._destroy = true; // Poison pill
      delete stream[track.id];
    });

    Object.keys(stream).forEach((key) => delete stream[key]);
    stream = null;
    // Clean up canvas-related objects
    if (offscreenVideo) {
      offscreenVideo.pause();
      offscreenVideo.srcObject = null;
    }
    if (canvasStream) canvasStream.getTracks().forEach((track) => track.stop());
    currentStream = null;
    originalStream = null;
    offscreenVideo = null;
    canvas = null;
    canvasStream = null;
    ctx = null;
    videoPreview.value.srcObject = null;
    videoPreview.value.style.display = "none";
  } catch (error) {
    console.log(error.message);
  }
}

let Video_Audio_Url = ref();
let arrayBuffer = ref();
let finalizedBlob = ref();
// Save the recording
async function saveRecording() {
  try {
    let AudioStorageRef = EditMode.value ? Edit_Mode_AudioStorage : AudioStorage;
    let VideoStorageRef = EditMode.value ? Edit_Mode_VideoStorage : VideoStorage;

    let blob = new Blob(recordedChunks.value, {
      type: supportedMime.value.replace(/,opus|,vorbis/g, ""),
    });
    recordedChunks.value.splice(0, recordedChunks.value.length); // releasing resouces
    // Convert the Blob to an ArrayBuffer for finalization
    arrayBuffer.value = await blob.arrayBuffer();
    finalizedBlob.value = new Blob([arrayBuffer.value], {
      type: supportedMime.value.replace(/,opus|,vorbis/g, ""),
    });
    console.log("final blob--> ", finalizedBlob.value);

    Video_Audio_Url.value = createTrackedObjectURL(finalizedBlob.value);
    if (!Video_Audio_Url.value) Show_Critical_Error("Url Generation Failed ");
    console.log("url: ", Video_Audio_Url.value);

    let base64 = await blobToBase64(finalizedBlob.value);
    console.log("base64--> ", base64);

    Start_Video_Audio_Preview(finalizedBlob.value, Video_Audio_Url.value);

    if (finalizedBlob.value.type.includes("audio")) {
      AudioStorageRef.value.push({
        name: `AudioRec_${++i}_Attached`,
        Data: base64,
        Type: "Video",
        Size: finalizedBlob.value.size,
        timestamp: Date.now(),
        deletion: false,
      });
      CurrentlyWritingMessage.value += `\nAudioRec_${i}_Attached`;
      console.log("Audio recording saved.");
      base64 = null; // releasing resouces
    } else if (finalizedBlob.value.type.includes("video")) {
      VideoStorageRef.value.push({
        name: `VideoRec_${++j}_Attached`,
        Data: base64,
        Type: "Video",
        Size: finalizedBlob.value.size,
        timestamp: Date.now(),
        deletion: false,
      });
      CurrentlyWritingMessage.value += `\nVideoRec_${j}_Attached`;
      console.log("Video recording saved.");
      base64 = null; // releasing resouces
    } else {
      console.error("Unknown media type:", finalizedBlob.value.type);
    }
    blob = null;
    arrayBuffer.value = null;
    finalizedBlob.value = null;
    base64 = null;
    //    setTimeout(() => URL.revokeObjectURL(Video_Audio_Url.value), 500); // 🟢 Revoke after 1s
  } catch (error) {
    console.log(error.message);
    URL.revokeObjectURL(Video_Audio_Url.value); // 🟢 Revoke on error
  }
}

function blobToBase64(blob) {
  try {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result); // reader.result is a data URL
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.log(error.message);
  } finally {
    blob = null;
  }
}

function Start_Video_Audio_Preview(blob, url) {
  try {
    Max_Accumulated_Attachments_Size.value -= blob.size;

    if (EditMode.value) {
      blob.type.includes("audio")
        ? (Edit_Mode_Toggle_Audio_Preview.value = true)
        : (Edit_Mode_Toggle_Video_Preview.value = true);
      setTimeout(() => {
        blob.type.includes("audio")
          ? (Edit_Mode_Audio_Preview_Element.value.src = url)
          : (Edit_Mode_Video_Preview_Element.value.src = url);
      }, 5);
    } else {
      blob.type.includes("audio")
        ? (Done_Mode_Toggle_Audio_Preview.value = true)
        : (Done_Mode_Toggle_Video_Preview.value = true);
      setTimeout(() => {
        blob.type.includes("audio")
          ? (Done_Mode_Audio_Preview_Element.value.src = url)
          : (Done_Mode_Video_Preview_Element.value.src = url);
      }, 5);
    }
  } catch (error) {
    console.log(error.message);
  }
}

function Close_Video_Audio_Preview() {
  try {
    URL.revokeObjectURL(Video_Audio_Url.value);
    Video_Audio_Url.value = null;
    finalizedBlob.value = null;
    arrayBuffer.value = null;
    if (EditMode.value) {
      Edit_Mode_Video_Preview_Element.value.src = null;
      Edit_Mode_Audio_Preview_Element.value.src = null;
      Edit_Mode_Toggle_Audio_Preview.value = false;
      Edit_Mode_Toggle_Video_Preview.value = false;
    } else {
      Done_Mode_Video_Preview_Element.value.src = null;
      Done_Mode_Audio_Preview_Element.value.src = null;
      Done_Mode_Toggle_Audio_Preview.value = false;
      Done_Mode_Toggle_Video_Preview.value = false;
    }
  } catch (error) {
    console.log(error.message);
  }
}

/* --------------------------- */

/* --------------------------- */

function Cleaning(name) {
  try {
    let pattern = new RegExp(name, "g");
    return CurrentlyWritingMessage.value.replace(pattern, "").trim();
  } catch (error) {
    console.log(error.message);
  }
}

function delete_media(index, type) {
  try {
    console.log(index + " " + type);

    let storage, editStorage;

    // Determine which storage to use based on type
    switch (type) {
      case "video":
        storage = VideoStorage;
        editStorage = Edit_Mode_VideoStorage;
        Close_Video_Audio_Preview();
        break;
      case "audio":
        storage = AudioStorage;
        editStorage = Edit_Mode_AudioStorage;
        Close_Video_Audio_Preview();
        break;
      case "image":
        storage = images;
        editStorage = Edit_Mode_images;
        break;
      case "doc":
        storage = DocumentStorage;
        editStorage = Edit_Mode_DocumentStorage;
        break;
      default:
        console.log("Invalid media type:", type);
        return;
    }

    // Select the appropriate list based on Edit Mode
    let list = EditMode.value ? editStorage : storage;

    if (!list.value[index]) {
      throw new Error(`Item at index ${index} not found.`);
    }

    let item = list.value[index];
    let name = item.name;

    // Restore attachment size
    Max_Accumulated_Attachments_Size.value += item.Size;

    if (EditMode.value) {
      data.value[CurrentIndex.value].Attachment_Used_Size += item.Size;
    }

    // Mark for deletion
    item.deletion = true;

    // Wait for animation, then remove item
    Delete_Note_Sound.play();
    setTimeout(() => {
      list.value.splice(index, 1);
    }, 300);

    // Update UI message
    if (name) {
      CurrentlyWritingMessage.value = Cleaning(name);
    }
  } catch (error) {
    console.log(`Error deleting ${type}:`, error.message);
  }
}

function Show_Create_Edit_Model_Warning(message, timeOut) {
  try {
    Note_Attachment_Limit_Warning_Message.value.textContent = message;
    Attachment_Capacity_Violation_Toggle_Message.value = true;
    setTimeout(
      () => (Attachment_Capacity_Violation_Toggle_Message.value = false),
      timeOut
    );
  } catch (error) {
    console.log(error.message);
  }
}

function manageMedia(file) {
  try {
    const selectedFile = file.target.files[0];
    if (!selectedFile) return; // Exit if no file was selected

    // Check if file size exceeds allowed maximum
    if (selectedFile.size >= Max_Accumulated_Attachments_Size.value) {
      let warning =
        Max_Accumulated_Attachments_Size.value >=
        Max_Accumulated_Attachments_Size_Buffer.value
          ? `Max Supported Size is ${(
              Max_Accumulated_Attachments_Size_Buffer.value /
              1024 /
              1024
            ).toFixed(1)}MB!`
          : `${
              (Max_Accumulated_Attachments_Size.value / 1024 / 1024).toFixed(1) > 0
                ? (Max_Accumulated_Attachments_Size.value / 1024 / 1024).toFixed(1)
                : 0
            }MB Capacity Limit Left!`;
      Show_Create_Edit_Model_Warning(warning, 3000);
      file.target.value = ""; // Reset file input
      return;
    }

    // Check if the file type is supported
    if (!SupportedMedia.value.includes(selectedFile.type)) {
      Show_Create_Edit_Model_Warning("File Not Supported!", 1500);
      file.target.value = ""; // Reset file input
      return;
    }

    // Determine which storage to use and the file category (text, image, video, audio, document)
    let storage = null;
    let storageType = "";

    if (SupportedText.value.includes(selectedFile.type)) {
      storageType = "text";
    } else if (selectedFile.type.startsWith("image/")) {
      storage = EditMode.value ? Edit_Mode_images : images;
      storageType = "image";
    } else if (selectedFile.type.startsWith("video/")) {
      storage = EditMode.value ? Edit_Mode_VideoStorage : VideoStorage;
      storageType = "video";
    } else if (SupportedAudios.value.includes(selectedFile.type)) {
      storage = EditMode.value ? Edit_Mode_AudioStorage : AudioStorage;
      storageType = "audio";
    } else if (
      [
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "application/vnd.ms-excel",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      ].includes(selectedFile.type)
    ) {
      storage = EditMode.value ? Edit_Mode_DocumentStorage : DocumentStorage;
      storageType = "document";
    }

    // If the file belongs to one of the storages, check for duplicates (same name & size)
    if (storage) {
      const alreadyAdded = storage.value.some(
        (item) => item.name === selectedFile.name && item.Size === selectedFile.size
      );
      if (alreadyAdded) {
        console.log("File already added, skipping duplicate");
        Show_Create_Edit_Model_Warning("File Already Added!", 1500);
        file.target.value = ""; // Reset file input
        return;
      }
    }

    // Create a FileReader to read the file
    const rawfile = new FileReader();

    // Use different reading methods based on file type
    if (SupportedText.value.includes(selectedFile.type)) {
      rawfile.readAsText(selectedFile);
    } else {
      rawfile.readAsDataURL(selectedFile);
    }

    rawfile.onloadend = () => {
      const fileType = selectedFile.type;
      const fileName = selectedFile.name;
      const fileSize = selectedFile.size;
      let fileData = rawfile.result;

      // If it's a text file, append its content to the writing message
      if (storageType === "text") {
        CurrentlyWritingMessage.value += fileData;
      }

      // For each supported type, push an object with file details into the proper storage
      if (storageType === "image") {
        storage.value.push({
          name: fileName,
          Data: fileData,
          Type: fileType,
          Size: fileSize,
          timestamp: Date.now(),
          deletion: false,
        });
        CurrentlyWritingMessage.value += `\n${fileName}`;
      } else if (storageType === "video") {
        storage.value.push({
          name: fileName,
          Data: fileData,
          Type: fileType,
          Size: fileSize,
          timestamp: Date.now(),
          deletion: false,
        });
        CurrentlyWritingMessage.value += `\n${fileName}`;
      } else if (storageType === "audio") {
        storage.value.push({
          name: fileName,
          Data: fileData,
          Type: fileType,
          Size: fileSize,
          timestamp: Date.now(),
          deletion: false,
        });
        CurrentlyWritingMessage.value += `\n${fileName}`;
      } else if (storageType === "document") {
        storage.value.push({
          name: fileName,
          Data: fileData,
          Type: fileType,
          Size: fileSize,
          timestamp: Date.now(),
          deletion: false,
        });
        CurrentlyWritingMessage.value += `\n${fileName}`;
      }

      // Deduct the size of the added file from the max attachments size
      Max_Accumulated_Attachments_Size.value -= fileSize;

      // Reset the file input to allow reselecting the same file in the future
      file.target.value = "";
      fileData = null;
    };
  } catch (error) {
    console.log(error.message);
  }
}

function generateRandomColor() {
  try {
    let hue = Math.floor(Math.random() * 360); // Full range of colors
    let saturation = Math.floor(Math.random() * (90 - 70 + 1)) + 70; // 80-100% saturation
    let lightness = Math.floor(Math.random() * (60 - 45 + 1)) + 45; // 50-70% lightness
    let opacity = 0.85; // Soft transparency

    return `hsla(${hue}, ${saturation}%, ${lightness}%, ${opacity})`;
  } catch (error) {
    console.log(error.message);
  }
}

// ..... Generate same but deep color for card title this CardTitleColor also give color to card itself .......
function AddNoteBtn() {
  try {
    inputData.value = "";
    SearchBtnLogic();
    Note_heading_element.value.textContent = "Create Note";
    EditMode.value = false;
    Create_Edit_Btn_Sound.play();
    isAddBtnPressed.value = true;
    Blur_Background_WhileOpening_Note.value = true;
  } catch (error) {
    console.log(error.message);
  }
}

async function Get_Media_from_Db(id) {
  let media = null;
  let Decompressed_Media = null;
  try {
    media = await db.media.get(id); // Wait for the media to be fetched
    if (!media) {
      console.log("No media found");
      return null;
    }
    Decompressed_Media = await CreateWorker(media.blob, false); // Wait for processing
    console.log("Decompressed_Media ", Decompressed_Media);
    return Decompressed_Media;
  } catch (error) {
    console.log(error.message);
    return null;
  } finally {
    console.log(
      "Cleaning up media after get from database and decompressed it for RO_..."
    );
    media = null;
    Decompressed_Media = null;
  }
}

let Decompressed_Media = ref(null);
async function RO_ViewNotePage(index) {
  try {
    updateRefreshKey();
    SendNoteForView_Title.value = data.value[index].title;
    SendNoteForView_Message.value = data.value[index].userWrote;
    Blur_Background_WhileOpening_Note.value = true;
    View_Btn_Sound.play();
    setTimeout(() => (IsRoViewNoteOpen.value = true), 5);
    Decompressed_Media.value = await Get_Media_from_Db(data.value[index].id);

    if (Decompressed_Media.value) {
      if (Decompressed_Media.value.ImageFile.length > 0)
        SendImageForView.value = Decompressed_Media.value.ImageFile;

      if (Decompressed_Media.value.AudioFiles.length > 0)
        SendAudioForView.value = Decompressed_Media.value.AudioFiles;

      if (Decompressed_Media.value.VideoFiles.length > 0)
        SendVideoForView.value = Decompressed_Media.value.VideoFiles;

      if (Decompressed_Media.value.DocumentFiles.length > 0)
        SendDocumentForView.value = Decompressed_Media.value.DocumentFiles;
    }
    //inputData.value = "";
  } catch (error) {
    console.log(error.message);
  }
}

async function EditBtn(index) {
  try {
    Note_heading_element.value.textContent = "Edit Note";
    disable_color_notes_switcher_btn.value = false;
    /* inputData.value = ""; */
    Note_Createt_Close_btn.value.style.display = "none";
    Create_Edit_Btn_Sound.play();
    EditMode.value = true;
    isAddBtnPressed.value = true;
    Blur_Background_WhileOpening_Note.value = true;
    /////
    Save_The_Create_Notes_Max_Accu_Attachment_Capacity_While_Switching_To_Edit_Note.value =
      Max_Accumulated_Attachments_Size.value;
    if (CurrentlyWritingMessage.value !== "" || CurrentlyWritingMessage.value !== "") {
      temp_for_save_Create_Note_Text_if_available_parallelly.value[0] =
        CurrentlyWritingTitle.value;
      temp_for_save_Create_Note_Text_if_available_parallelly.value[1] =
        CurrentlyWritingMessage.value;
    }
    Max_Accumulated_Attachments_Size.value = data.value[index].Attachment_Used_Size;

    console.log("testing--> MAX ", Max_Accumulated_Attachments_Size.value);
    console.log("testing--> Used Size ", data.value[index].Attachment_Used_Size);
    /////
    CurrentlyWritingMessage.value = data.value[index].userWrote;
    CurrentlyWritingTitle.value = data.value[index].title;
    CurrentIndex.value = index;
    /* Useful for edit mode like send all note data to array se delete buttons can acees it then modify & send it back to note*/
    if (EditMode.value) {
      let Decompressed_Media = await Get_Media_from_Db(data.value[index].id);
      console.log("Decompressed_Media ", Decompressed_Media);

      // Push items into edit mode arrays
      Decompressed_Media.ImageFile.forEach((element) => {
        Edit_Mode_images.value.push(element);
        console.log("db note item ", element);
      });

      Decompressed_Media.AudioFiles.forEach((element) => {
        Edit_Mode_AudioStorage.value.push(element);
        console.log("db note item ", element);
      });

      Decompressed_Media.VideoFiles.forEach((element) => {
        Edit_Mode_VideoStorage.value.push(element);
        console.log("db note item ", element);
      });

      Decompressed_Media.DocumentFiles.forEach((element) => {
        Edit_Mode_DocumentStorage.value.push(element);
        console.log("db note item ", element);
      });

      // Clear the database-fetched arrays
      Decompressed_Media.ImageFile.splice(0, Decompressed_Media.ImageFile.length);
      Decompressed_Media.AudioFiles.splice(0, Decompressed_Media.AudioFiles.length);
      Decompressed_Media.VideoFiles.splice(0, Decompressed_Media.VideoFiles.length);
      Decompressed_Media.DocumentFiles.splice(0, Decompressed_Media.DocumentFiles.length);
      //Decompressed_Media = null;

      console.log("Edit_Mode_images ", Edit_Mode_images.value);
      console.log("Edit_Mode_AudioStorage ", Edit_Mode_AudioStorage.value);
      console.log("Edit_Mode_VideoStorage ", Edit_Mode_VideoStorage.value);
      console.log("Edit_Mode_DocumentStorage ", Edit_Mode_DocumentStorage.value);
    }
  } catch (error) {
    console.log(error.message);
  }
}

function DeleteCard(index) {
  try {
    data.value[index].isCardGoingDeleted = true;
    ///
    Newly_Created_Notes_Id_For_Backend_To_Avoid_Send_Them_During_pagination.value = Newly_Created_Notes_Id_For_Backend_To_Avoid_Send_Them_During_pagination.value.filter(
      (item) => item !== data.value[index].id
    );
    ///
    setTimeout(() => {
      DeleteNote(data.value[index].id);
      data.value.splice(index, 1);
    }, 300);
  } catch (error) {
    console.log(error.message);
  }
}

// ........................ This Big function for save data when save or done buton pressed ..........................
function DoneBtn() {
  try {
    // ......................... function for save data when in editing mode ..............................
    if (EditMode.value) {
      Edit_Mode_Done_Btn();
    }
    // .................. function for save data when in new card creating mode ............................
    else {
      Create_Note_Done_Btn();
    }
    stopRecording();
    Cleaning_Link_from_ram();
    purgeObjectURLs();
    terminateAllWorkers();
  } catch (error) {
    console.log(error.message);
  }
}

function Edit_Mode_Done_Btn() {
  try {
    data.value[CurrentIndex.value].userWrote = CurrentlyWritingMessage.value;
    data.value[CurrentIndex.value].title = CurrentlyWritingTitle.value;
    ////
    let currentDate = new Date();
    let formattedDate = currentDate.toLocaleDateString();
    data.value[CurrentIndex.value].NotesDate = formattedDate;
    ////;
    Close_Video_Audio_Preview();
    //////////
    data.value[CurrentIndex.value].IsLoading = true;
    /////////////
    let edit_note_media_object = Working_Along_Side_With_Done_Btn(
      data.value[CurrentIndex.value].id
    );

    isAddBtnPressed.value = false;
    Blur_Background_WhileOpening_Note.value = false;
    CurrentlyWritingTitle.value =
      temp_for_save_Create_Note_Text_if_available_parallelly.value[0];
    CurrentlyWritingMessage.value =
      temp_for_save_Create_Note_Text_if_available_parallelly.value[1];

    data.value[CurrentIndex.value].Attachment_Used_Size =
      Max_Accumulated_Attachments_Size.value;

    Max_Accumulated_Attachments_Size.value =
      Save_The_Create_Notes_Max_Accu_Attachment_Capacity_While_Switching_To_Edit_Note.value;
    Note_Createt_Close_btn.value.style.display = "block";
    EditMode.value = false;
    disable_color_notes_switcher_btn.value = true;
    //Overwriting local storage with new data.
    setTimeout(async () => {
      await Update_Note(data.value[CurrentIndex.value], edit_note_media_object);
      edit_note_media_object = null;
    }, 10);
    /* Pressing Add Note button will automatciall set EditMode to false when pressed until edit mode is oned */
  } catch (error) {
    console.log(error.message);
  }
}

let note_And_media_id = null;
function Create_Note_Done_Btn() {
  try {
    if (
      CurrentlyWritingMessage.value.trim() !== "" &&
      CurrentlyWritingTitle.value.trim() !== ""
    ) {
      let currentDate = new Date();
      let formattedDate = currentDate.toLocaleDateString();
      let gettingColor = generateRandomColor();
      let result = gettingColor.slice(0, -5) + "1.0)";
      note_And_media_id = Math.floor(Math.random() * 10000);

      //.................................. Object For Array To Make New Cards .................................
      Note_Object = {
        title: CurrentlyWritingTitle.value,
        userWrote: CurrentlyWritingMessage.value,
        NotesDate: formattedDate,
        isCardGoingDeleted: false,
        IsLoading: true,
        id: note_And_media_id,
        Card_Title_Color: Is_Sticky_Colorful_Card.value ? result : "rgb(68 68 68)",
        Card_Para_Color: Is_Sticky_Colorful_Card.value ? gettingColor : "rgb(46 46 46)",
        Card_Footer_Color: Is_Sticky_Colorful_Card.value ? result : "rgb(68 68 68)",
        Attachment_Used_Size: Max_Accumulated_Attachments_Size.value,
        TimeStamp: new Date().toISOString(),
      };

      let create_note_media_object = Working_Along_Side_With_Done_Btn();

      //.............................................Here Pushing object To Array ................................
      CurrentlyWritingMessage.value = "";
      CurrentlyWritingTitle.value = "";
      Close_Video_Audio_Preview();
      isAddBtnPressed.value = false;
      Blur_Background_WhileOpening_Note.value = false;
      Max_Accumulated_Attachments_Size.value =
        Max_Accumulated_Attachments_Size_Buffer.value;
      ///
      setTimeout(async () => {
        await Post_Note(Note_Object, create_note_media_object);
        create_note_media_object = null;
      }, 30);

      //Overwriting local storage with new data.
    }
    //..............................Error If It Found Inputs Fields Are Empty .....................................
    else {
      Show_Create_Edit_Model_Warning("Please Fill Both Boxes.", 1500);
    }
  } catch (error) {
    console.log(error.message);
  }
}

let media_object = ref({
  id: null,
  ImageFile: [],
  AudioFiles: [],
  VideoFiles: [],
  DocumentFiles: [],
});

function Working_Along_Side_With_Done_Btn(edit_mode_note_id) {
  try {
    const updateAndClearStorage = (source, target) => {
      source.forEach((item) => {
        console.log("Loop items ", item);
        target.push(item);
        console.log("Target ", target);
      });
      source.splice(0, source.length); // Clear the source after transfer
      console.log("Cleaning Arrays ", source);
    };

    if (EditMode.value) {
      console.log("Editmode Enter in Done Helper");
      media_object.value.id = edit_mode_note_id;
      // Edit Mode: Update existing note
      updateAndClearStorage(Edit_Mode_images.value, media_object.value.ImageFile);
      updateAndClearStorage(Edit_Mode_AudioStorage.value, media_object.value.AudioFiles);
      updateAndClearStorage(Edit_Mode_VideoStorage.value, media_object.value.VideoFiles);
      updateAndClearStorage(
        Edit_Mode_DocumentStorage.value,
        media_object.value.DocumentFiles
      );
    } else {
      console.log("Note Create Mode Enter in Done Helper");
      media_object.value.id = note_And_media_id;
      // Create Mode: Add new note
      updateAndClearStorage(images.value, media_object.value.ImageFile);
      updateAndClearStorage(AudioStorage.value, media_object.value.AudioFiles);
      updateAndClearStorage(VideoStorage.value, media_object.value.VideoFiles);
      updateAndClearStorage(DocumentStorage.value, media_object.value.DocumentFiles);
      data.value.push(Note_Object); // Add the new note to the main list
    }

    toggle_delete_model.value = false;
    Done_Btn_Sound.play();
    console.log("images array-> ", images.value);
    console.log("audio array-> ", AudioStorage.value);
    console.log("video array-> ", VideoStorage.value);
    console.log("document array-> ", DocumentStorage.value);
    console.log("\n Edit-Mode-images array-> ", Edit_Mode_images.value);
    console.log("Edit-Mode-AudioStorage array-> ", Edit_Mode_AudioStorage.value);
    console.log("Edit-Mode-VideoStorage array-> ", Edit_Mode_VideoStorage.value);
    console.log("Edit-Mode-DocumentStorage array-> ", Edit_Mode_DocumentStorage.value);
    console.log("\nMedia Object ", media_object.value);

    return media_object.value;
  } catch (error) {
    console.error(
      "An error occurred in Working_Along_Side_With_Done_Btn:",
      error.message
    );
  }
}

//.................................. A Function To Move Cursor, Enter to Save ...........................................
onMounted(() => {
  try {
    Note_Making_UI_Element.value.addEventListener("keyup", (event) => {
      if (event.key === "Escape") {
        CloseBtn();
      }
    });

    note_view_ui_element.value.addEventListener("keyup", (event) => {
      if (event.key === "Escape") {
        CloseBtn();
      }
    });

    focusOnInput.value.addEventListener("keyup", (event) => {
      if (event.key === "Enter") {
        TextAreaElement.value.focus(); // Shift focus to the note input box
      } else if (event.key == "Enter" && event.shiftKey) {
        DoneBtn();
      }
    });

    TextAreaElement.value.addEventListener("keyup", (event) => {
      if (event.key == "Enter" && event.shiftKey) {
        DoneBtn();
      }
    });
  } catch (error) {
    console.log(error.message);
  }
});

watch(isAddBtnPressed, (newval) => {
  try {
    if (newval && focusOnInput.value)
      setTimeout(() => {
        focusOnInput.value.focus();
      }, 350);
  } catch (error) {
    console.log(error.message);
  }
});

let Making_Debounce = debounce(SearchBtnLogic, 200);

function Debounce_Search() {
  try {
    Making_Debounce();
  } catch (error) {
    console.log(error.message);
  }
}

function SearchBtnLogic() {
  try {
    console.log("calling seach method");

    // Search input event listener
    let data = inputData.value.toLowerCase();
    let notesFound = false; // Flag to check if any notes match

    if (Card.value) {
      Card.value.forEach((card) => {
        if (card) {
          let title = card.children[0].firstChild.textContent.toLowerCase().trim();
          let description = card.children[1].firstChild.textContent.toLowerCase().trim();
          let datetime = card.children[3].firstChild.textContent.toLowerCase().trim();
          if (
            title.includes(data) ||
            description.includes(data) ||
            datetime.includes(data) ||
            inputData.value === ""
          ) {
            card.style.display = "flex";
            setTimeout(() => {
              card.classList.remove("smoothhide");
            }, 100);
            notesFound = true; // At least one note matches
          } else {
            card.classList.add("smoothhide");
            setTimeout(() => {
              card.style.display = "none";
            }, 200);
          }
        }
      });
      // Toggle "No Notes Found" message
      if (!notesFound) {
        No_Notes_Found_Message_Element.value.style.display = "flex";
      } else {
        No_Notes_Found_Message_Element.value.style.display = "none";
      }
    }
  } catch (error) {
    console.log(error.message);
  }
}

function AdjustCameraScreenSize() {
  try {
    videoPreview.value.style.width = TextAreaElement.value.offsetWidth + "px"; // Append "px"
    videoPreview.value.style.height = TextAreaElement.value.offsetHeight + "px"; // Append "px"
    console.log(videoPreview.value.offsetWidth, "\n", TextAreaElement.value.offsetHeight);
  } catch (error) {
    console.log(error.message);
  }
}

function Scroll_Control(event) {
  try {
    if (View_Note_Page_UI.value) {
      if (event.key === "ArrowDown") {
        View_Note_Page_UI.value.scrollTop += 50; // Adjust the scroll amount as needed
      } else if (event.key === "ArrowUp") {
        View_Note_Page_UI.value.scrollTop -= 50; // Adjust the scroll amount as needed
      }
    }
  } catch (error) {
    console.log(error.message);
  }
}

onMounted(() => {
  document.addEventListener("keydown", Scroll_Control);
  document.removeEventListener("keyup", Scroll_Control);
  window.addEventListener("resize", AdjustCameraScreenSize);
  ////
  Is_Sticky_Colorful_Card.value = JSON.parse(
    localStorage.getItem("Colorful_Notes") || false
  ); // here we use json parse due to local storage return string and in case of boolean its bad.
  sort_order.value = localStorage.getItem("sort_order") || "desc";
  Alignment_index.value = localStorage.getItem("align_text") || 1;
  SeedNote_On_first_time_app_load();
  fetchAllNotes();
  change_text_alignment();
  storage_capacity_checker();
  window.addEventListener("scroll", debouncedScroll);
});

// Computed properties using your structure
const Video_Array = computed(() => {
  const baseArr = EditMode.value ? Edit_Mode_VideoStorage.value : VideoStorage.value;
  console.log("Video Array in computed =>", baseArr);
  return baseArr.filter((item) => item.name.trim() !== "");
});

const Audio_Array = computed(() => {
  const baseArr = EditMode.value ? Edit_Mode_AudioStorage.value : AudioStorage.value;
  console.log("Audio Array in computed =>", baseArr);
  return baseArr.filter((item) => item.name.trim() !== "");
});

const Image_Array = computed(() => {
  const baseArr = EditMode.value ? Edit_Mode_images.value : images.value;
  console.log("Image Array in computed =>", baseArr);
  return baseArr.filter((item) => item.name.trim() !== "");
});

const Document_Array = computed(() => {
  const baseArr = EditMode.value
    ? Edit_Mode_DocumentStorage.value
    : DocumentStorage.value;
  console.log("Document Array in computed =>", baseArr);
  return baseArr.filter((item) => item.name.trim() !== "");
});

/* watch(
  Video_Array,
  (newVal, oldVal) => {
    console.log("Video_Array changed", { oldVal, newVal });
    // Do any extra handling here if needed (e.g. cleanup if items were removed)
  },
  { deep: true }
);

watch(
  Audio_Array,
  (newVal, oldVal) => {
    console.log("Audio_Array changed", { oldVal, newVal });
  },
  { deep: true }
);

watch(
  Image_Array,
  (newVal, oldVal) => {
    console.log("Image_Array changed", { oldVal, newVal });
  },
  { deep: true }
);

watch(
  Document_Array,
  (newVal, oldVal) => {
    console.log("Document_Array changed", { oldVal, newVal });
  },
  { deep: true }
); */

onUnmounted(() => {
  stopRecording();
  Cleaning_Link_from_ram();
  db.close();
  stopStream(currentStream);
  document.removeEventListener("keydown", Scroll_Control);
  window.removeEventListener("resize", AdjustCameraScreenSize);
  window.removeEventListener("scroll", debouncedScroll); // 🟢 Add this
  window.removeEventListener("resize", AdjustCameraScreenSize);
  terminateAllWorkers();
  purgeObjectURLs();
  console.log("All workers terminated and object URLs purged.");
});

// Add to component unmount
onUnmounted(() => {
  const domCemetery = document.createElement("div");
  domCemetery.id = "zombie_graveyard";
  document.body.appendChild(domCemetery);

  [videoPreview.value, overlayElement.value].forEach((el) => {
    if (el) {
      el.classList.add("deceased");
      domCemetery.appendChild(el.cloneNode(true));
      el.remove();
    }
  });

  setTimeout(() => {
    domCemetery.innerHTML = "";
    document.body.removeChild(domCemetery);
  }, 0);
});

const urlRegistry = new Map();

function createTrackedObjectURL(blob) {
  let url = null;
  try {
    url = URL.createObjectURL(blob);
    urlRegistry.set(url, {
      blob,
      created: Date.now(),
      stack: new Error().stack,
    });
    return url;
  } catch (error) {
    console.log(error.message);
  } finally {
    blob = null;
    url = null;
  }
}

function purgeObjectURLs() {
  try {
    urlRegistry.forEach((meta, url) => {
      URL.revokeObjectURL(url);
      meta.blob = null;
      console.log(`Object URL revoked: ${url}`);
    });
    urlRegistry.clear();
    console.log("All object URLs purged.");
  } catch (error) {
    console.error("Failed to purge object URLs:", error.message);
  }
}

// User Data.
let data = ref([]);
</script>
