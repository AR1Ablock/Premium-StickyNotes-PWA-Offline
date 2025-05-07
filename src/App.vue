<template>
  <div class="wrapper">
    <!-- Loading Screen -->
    <div class="loading" v-if="Remove_Loading_Screen" :class="{ active: !Loading }">
      <p></p>
      <h1>Loading Notes...</h1>
    </div>

    <!-- Header -->
    <div
      class="Top_Container"
      :style="
        isAddBtnPressed || IsRoViewNoteOpen ? { borderBottom: '2px solid #e3b23c30' } : {}
      "
    >
      <div class="searchbar" :class="{ active: Blur_Background_WhileOpening_Note }">
        <h1>Sticky Notes</h1>
        <div class="search-container">
          <input
            name="Search_Bar"
            type="text"
            placeholder="Search notes..."
            class="searchinput showinput"
            ref="SearchInput_Element"
            v-model.trim="inputData"
            @input="Making_Debounce"
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
        :key="item.id + sort_order"
        :class="[
          { smoothhide: data[index].isCardGoingDeleted },
          { disable_Card_While_Saving: data[index].IsLoading },
        ]"
        :style="{ 'background-color': data[index].Card_Para_Color }"
      >
        <div
          class="Title_Con"
          :style="{ 'background-color': data[index].Card_Title_Color }"
        >
          <p class="Card_Title">{{ getShortText(item.title.substring(0, 18)) }}</p>
        </div>
        <div class="Para_Con" @click="RO_ViewNotePage(index)">
          <p class="Card_Para" ref="Each_Note_Preview">
            {{ getShortText(item.userWrote) }}
          </p>
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

          <div class="attachmentBtns MarkDownMenu" v-show="Toggle_MarkDown_Menu">
            <button ref="HeadingBtn" title="Heading" @click="heading">
              <svg width="32" height="32" viewBox="0 0 32 32">
                <!-- Rounded black background with gold border -->
                <rect
                  x="1"
                  y="1"
                  width="30"
                  height="30"
                  rx="6"
                  ry="6"
                  fill="none"
                  stroke="#FFD700"
                  stroke-width="2"
                />
                <!-- Centered text for heading -->
                <text
                  x="16"
                  y="22"
                  text-anchor="middle"
                  font-family="Georgia"
                  fill="#FFD700"
                  font-weight="bold"
                >
                  H1
                </text>
              </svg>
            </button>

            <button ref="BoldBtn" title="Bold" @click="bold">
              <svg width="32" height="32" viewBox="0 0 32 32">
                <!-- Background -->
                <rect
                  x="1"
                  y="1"
                  width="30"
                  height="30"
                  rx="6"
                  ry="6"
                  fill="none"
                  stroke="#FFD700"
                  stroke-width="2"
                />
                <!-- Bold letter -->
                <text
                  x="16"
                  y="22"
                  text-anchor="middle"
                  font-family="Georgia"
                  fill="#FFD700"
                  font-weight="bold"
                >
                  B
                </text>
              </svg>
            </button>

            <button ref="ItalicBtn" title="Italic" @click="italic">
              <svg width="32" height="32" viewBox="0 0 32 32">
                <!-- Background -->
                <rect
                  x="1"
                  y="1"
                  width="30"
                  height="30"
                  rx="6"
                  ry="6"
                  fill="none"
                  stroke="#FFD700"
                  stroke-width="2"
                />
                <!-- Italic letter -->
                <text
                  x="16"
                  y="22"
                  text-anchor="middle"
                  font-family="Georgia"
                  fill="#FFD700"
                  font-style="italic"
                >
                  I
                </text>
              </svg>
            </button>

            <button ref="CodeBtn" title="Code" @click="code">
              <svg
                width="32"
                height="32"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
                style="display: block"
              >
                <!-- Rounded square container -->
                <rect
                  x="1"
                  y="1"
                  width="22"
                  height="22"
                  rx="4"
                  ry="4"
                  fill="none"
                  stroke="#FFD700"
                  stroke-width="2"
                />

                <!-- Curly braces in gold -->
                <path
                  d="M9 8c-1 1-1 2.5-1 4s0 3 1 4"
                  fill="none"
                  stroke="#FFD700"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
                <path
                  d="M15 16c1-1 1-2.5 1-4s0-3-1-4"
                  fill="none"
                  stroke="#FFD700"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>
            </button>

            <button ref="LinkBtn" title="Link" @click="link">
              <svg
                width="32"
                height="32"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
                style="display: block"
              >
                <!-- Rounded square container -->
                <rect
                  x="1"
                  y="1"
                  width="22"
                  height="22"
                  rx="4"
                  ry="4"
                  fill="none"
                  stroke="#FFD700"
                  stroke-width="2"
                />

                <!-- Larger chain link: two ovals -->
                <!-- Left oval -->
                <path
                  d="M4 12c0-2 1.6-3.5 3.5-3.5h2c2 0 3.5 1.6 3.5 3.5s-1.6 3.5-3.5 3.5h-2c-2 0-3.5-1.6-3.5-3.5z"
                  fill="none"
                  stroke="#FFD700"
                  stroke-width="1.8"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
                <!-- Right oval -->
                <path
                  d="M11.5 12c0-2 1.6-3.5 3.5-3.5h2c2 0 3.5 1.6 3.5 3.5s-1.6 3.5-3.5 3.5h-2c-2 0-3.5-1.6-3.5-3.5z"
                  fill="none"
                  stroke="#FFD700"
                  stroke-width="1.8"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>
            </button>

            <button ref="UnderlineBtn" title="Underline" @click="underline">
              <svg
                width="32px"
                height="32px"
                viewBox="1 0 16 12.5"
                fill="#FFD700"
                stroke="#FFD700"
                stroke-width="0.6"
                xmlns="http://www.w3.org/2000/svg"
              >
                <g transform="scale(1.15) translate(-0.7, -0.7)">
                  <path
                    d="M5.5 1a.5.5 0 0 1 .5.5v5a2.5 2.5 0 0 0 5 0v-5a.5.5 0 0 1 1 0v5a3.5 3.5 0 0 1-7 0v-5a.5.5 0 0 1 .5-.5z"
                  />
                  <path d="M2.5 11.3a.5.5 0 0 0 0 1h11a.5.5 0 0 0 0-1h-11z" />
                </g>
              </svg>
            </button>

            <button ref="StrikerBtn" title="Strike" @click="striker">
              <svg width="32" height="32" viewBox="0 0 32 32">
                <!-- Background -->
                <rect
                  x="1"
                  y="1"
                  width="30"
                  height="30"
                  rx="6"
                  ry="6"
                  fill="none"
                  stroke="#FFD700"
                  stroke-width="2"
                />
                <!-- Strike letter -->
                <text
                  x="16"
                  y="22"
                  text-anchor="middle"
                  font-family="Georgia"
                  fill="#FFD700"
                >
                  S
                </text>
                <!-- Horizontal line for strike-through -->
                <line x1="8" y1="16" x2="24" y2="16" stroke="#FFD700" stroke-width="2" />
              </svg>
            </button>

            <button
              ref="CheckboxBtn"
              @click="Checkbox"
              title="Checkbox"
              :class="{ Active_btn: isCheckboxSticky }"
            >
              <svg
                width="32"
                height="32"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
              >
                <g transform="translate(12 12) scale(1.2) translate(-12 -12)">
                  <!-- Outer box -->
                  <rect
                    x="3"
                    y="3"
                    width="18"
                    height="18"
                    rx="3"
                    stroke="#FFD700"
                    stroke-width="1.5"
                    fill="none"
                  />
                  <!-- Checkmark -->
                  <path
                    d="M7 12l4 4 6-8"
                    stroke="#FFD700"
                    stroke-width="2"
                    fill="none"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                </g>
              </svg>
            </button>

            <button ref="FontColorBtn" title="Text Color" @click="textColor">
              <svg
                width="32"
                height="32"
                viewBox="0 0 32 32"
                xmlns="http://www.w3.org/2000/svg"
              >
                <!-- Black background with gold border -->
                <rect
                  x="1"
                  y="1"
                  width="30"
                  height="30"
                  rx="6"
                  ry="6"
                  fill="none"
                  stroke="#FFD700"
                  stroke-width="2"
                />

                <!-- Large "A" in gold -->
                <text
                  x="16"
                  y="21.5"
                  text-anchor="middle"
                  font-family="Georgia"
                  font-weight="bold"
                  fill="#FFD700"
                >
                  A
                </text>
                <!-- Gold paint droplet to indicate color -->
                <!-- You can tweak the path for a different droplet shape -->
                <path
                  d="M22 11 
                             c0 2 -3 3 -3 6 
                             s1.5 4 3 4 
                             s3 -1.5 3 -4 
                             s-3 -4 -3 -6z"
                  fill="#FFD700"
                />
              </svg>
            </button>

            <button ref="HighlightBtn" title="Highlight" @click="highlight">
              <svg
                width="32"
                height="32"
                viewBox="0 0 32 32"
                xmlns="http://www.w3.org/2000/svg"
              >
                <!-- Black background with gold border -->
                <rect
                  x="1"
                  y="1"
                  width="30"
                  height="30"
                  rx="6"
                  ry="6"
                  fill="none"
                  stroke="#FFD700"
                  stroke-width="2"
                />

                <!-- Gold highlight rectangle behind the "A" -->
                <rect x="8" y="9" width="16" height="14" fill="#FFD700" />

                <!-- Large "A" in gold -->
                <text
                  x="16"
                  y="21"
                  text-anchor="middle"
                  font-family="Georgia"
                  font-weight="bold"
                  fill="black"
                >
                  A
                </text>
              </svg>
            </button>

            <button ref="UnorderListBtn" title="Bullet Points" @click="unorderedList">
              <svg width="32" height="32" viewBox="0 0 32 32">
                <!-- Background -->
                <rect
                  x="1"
                  y="1"
                  width="30"
                  height="30"
                  rx="6"
                  ry="6"
                  fill="none"
                  stroke="#FFD700"
                  stroke-width="2"
                />
                <!-- Three bullet points with horizontal lines -->
                <circle cx="10" cy="10" r="2" fill="#FFD700" />
                <line x1="14" y1="10" x2="26" y2="10" stroke="#FFD700" stroke-width="2" />
                <circle cx="10" cy="16" r="2" fill="#FFD700" />
                <line x1="14" y1="16" x2="26" y2="16" stroke="#FFD700" stroke-width="2" />
                <circle cx="10" cy="22" r="2" fill="#FFD700" />
                <line x1="14" y1="22" x2="26" y2="22" stroke="#FFD700" stroke-width="2" />
              </svg>
            </button>

            <button ref="OrderListBtn" title="Numbering Wise" @click="orderedList">
              <svg width="32" height="32" viewBox="0 0 32 32">
                <!-- Background -->
                <rect
                  x="1"
                  y="1"
                  width="30"
                  height="30"
                  rx="6"
                  ry="6"
                  fill="none"
                  stroke="#FFD700"
                  stroke-width="2"
                />
                <!-- Numbers on the left -->
                <text x="6" y="12" font-family="Georgia" font-size="10" fill="#FFD700">
                  1
                </text>
                <text x="6" y="20" font-family="Georgia" font-size="10" fill="#FFD700">
                  2
                </text>
                <text x="6" y="28" font-family="Georgia" font-size="10" fill="#FFD700">
                  3
                </text>
                <!-- Corresponding horizontal lines for list items -->
                <line x1="14" y1="10" x2="26" y2="10" stroke="#FFD700" stroke-width="2" />
                <line x1="14" y1="18" x2="26" y2="18" stroke="#FFD700" stroke-width="2" />
                <line x1="14" y1="26" x2="26" y2="26" stroke="#FFD700" stroke-width="2" />
              </svg>
            </button>

            <button ref="QuoteBtn" title="Quote" @click="blockquote">
              <svg
                width="32px"
                height="32px"
                viewBox="0 0 16 16"
                xmlns="http://www.w3.org/2000/svg"
                fill="#FFD700"
                stroke="#FFD700"
                stroke-width="0.5"
              >
                <g id="SVGRepo_iconCarrier">
                  <path
                    d="M2.5 3a.5.5 0 0 0 0 1h11a.5.5 0 0 0 0-1h-11zm5 3a.5.5 0 0 0 0 1h6a.5.5 0 0 0 0-1h-6zm0 3a.5.5 0 0 0 0 1h6a.5.5 0 0 0 0-1h-6zm-5 3a.5.5 0 0 0 0 1h11a.5.5 0 0 0 0-1h-11zm.79-5.373c.112-.078.26-.17.444-.275L3.524 6c-.122.074-.272.17-.452.287-.18.117-.35.26-.51.428a2.425 2.425 0 0 0-.398.562c-.11.207-.164.438-.164.692 0 .36.072.65.217.873.144.219.385.328.72.328.215 0 .383-.07.504-.211a.697.697 0 0 0 .188-.463c0-.23-.07-.404-.211-.521-.137-.121-.326-.182-.568-.182h-.282c.024-.203.065-.37.123-.498a1.38 1.38 0 0 1 .252-.37 1.94 1.94 0 0 1 .346-.298zm2.167 0c.113-.078.262-.17.445-.275L5.692 6c-.122.074-.272.17-.452.287-.18.117-.35.26-.51.428a2.425 2.425 0 0 0-.398.562c-.11.207-.164.438-.164.692 0 .36.072.65.217.873.144.219.385.328.72.328.215 0 .383-.07.504-.211a.697.697 0 0 0 .188-.463c0-.23-.07-.404-.211-.521-.137-.121-.326-.182-.568-.182h-.282a1.75 1.75 0 0 1 .118-.492c.058-.13.144-.254.257-.375a1.94 1.94 0 0 1 .346-.3z"
                  />
                </g>
              </svg>
            </button>

            <button title="Undo" @click="undoAction">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="32"
                height="32"
                viewBox="0 0 122.04 122.88"
              >
                <!-- Scale increased to 85% and re-centered -->
                <g transform="translate(9.153,9.216) scale(0.85)">
                  <path
                    d="M4.73,9.3v39.28h39.28l4.63,0l-3.27-3.28L33.91,33.85c0.76-0.73,1.54-1.44,2.36-2.11
         c1.08-0.88,2.22-1.72,3.38-2.48l0,0c6.02-3.92,13.21-6.21,20.94-6.21l0.01,0v-0.01c10.59,0,20.18,4.3,27.12,11.24
         c6.94,6.94,11.24,16.53,11.24,27.11h-0.01v0.05h0.01c0,10.59-4.3,20.19-11.24,27.12c-6.94,6.94-16.53,11.24-27.11,11.24v-0.01
         l-0.08,0v0.01c-3.7,0-7.39-0.54-10.93-1.59v0c-1.95-0.58-3.87-1.33-5.71-2.22c-9.39-4.54-16.65-12.8-19.87-22.87l-0.43-1.33
         L0,71.82l0.47,2.3l0.01,0.06v0.01c0.8,3.84,2,7.62,3.53,11.24v0.01c1.51,3.55,3.38,6.98,5.53,10.19
         c11.03,16.43,29.78,27.25,51.05,27.25l0.01,0v-0.01c16.96,0,32.33-6.88,43.43-17.99v-0.01c11.1-11.11,17.98-26.45,17.98-43.4
         l0.01,0v-0.05h-0.01c0-16.96-6.88-32.32-18-43.43l0,0C92.93,6.89,77.58,0.02,60.63,0.01V0l-0.06,0v0.01
         c-8.71,0-17.01,1.82-24.51,5.1c-1.21,0.53-2.42,1.11-3.6,1.71c-5.48,2.83-10.47,6.46-14.83,10.74L8,7.95
         L4.73,4.67V9.3L4.73,9.3L4.73,9.3z"
                    fill="none"
                    stroke="#FFD700"
                    stroke-width="10"
                    stroke-linejoin="round"
                    stroke-linecap="round"
                  />
                </g>
              </svg>
            </button>

            <button title="Redo" @click="redoAction">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="32"
                height="32"
                viewBox="0 0 122.04 122.88"
              >
                <!-- Mirror horizontally to flip undo → redo -->
                <g transform="translate(122.04 0) scale(-1 1)">
                  <!-- Scale and center as before -->
                  <g transform="translate(9.153 9.216) scale(0.85)">
                    <path
                      d="M4.73,9.3v39.28h39.28l4.63,0l-3.27-3.28L33.91,33.85c0.76-0.73,1.54-1.44,2.36-2.11
           c1.08-0.88,2.22-1.72,3.38-2.48l0,0c6.02-3.92,13.21-6.21,20.94-6.21l0.01,0v-0.01c10.59,0,20.18,4.3,27.12,11.24
           c6.94,6.94,11.24,16.53,11.24,27.11h-0.01v0.05h0.01c0,10.59-4.3,20.19-11.24,27.12c-6.94,6.94-16.53,11.24-27.11,11.24v-0.01
           l-0.08,0v0.01c-3.7,0-7.39-0.54-10.93-1.59v0c-1.95-0.58-3.87-1.33-5.71-2.22c-9.39-4.54-16.65-12.8-19.87-22.87l-0.43-1.33
           L0,71.82l0.47,2.3l0.01,0.06v0.01c0.8,3.84,2,7.62,3.53,11.24v0.01c1.51,3.55,3.38,6.98,5.53,10.19
           c11.03,16.43,29.78,27.25,51.05,27.25l0.01,0v-0.01c16.96,0,32.33-6.88,43.43-17.99v-0.01c11.1-11.11,17.98-26.45,17.98-43.4
           l0.01,0v-0.05h-0.01c0-16.96-6.88-32.32-18-43.43l0,0C92.93,6.89,77.58,0.02,60.63,0.01V0l-0.06,0v0.01
           c-8.71,0-17.01,1.82-24.51,5.1c-1.21,0.53-2.42,1.11-3.6,1.71c-5.48,2.83-10.47,6.46-14.83,10.74L8,7.95
           L4.73,4.67V9.3L4.73,9.3L4.73,9.3z"
                      fill="none"
                      stroke="#FFD700"
                      stroke-width="10"
                      stroke-linejoin="round"
                      stroke-linecap="round"
                    />
                  </g>
                </g>
              </svg>
            </button>

            <button title="Copy" @click="copySmartContent">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="32"
                height="32"
                viewBox="0 0 32 32"
              >
                <!-- Back sheet -->
                <rect
                  x="6"
                  y="5"
                  width="20"
                  height="24"
                  rx="3"
                  fill="none"
                  stroke="#FFD700"
                  stroke-width="2"
                />
                <!-- Front sheet -->
                <rect
                  x="3"
                  y="1"
                  width="20"
                  height="24"
                  rx="3"
                  fill="none"
                  stroke="#FFD700"
                  stroke-width="2"
                />
              </svg>
            </button>

            <button
              class="close_Mark_Down_Menu"
              @click="Toggle_MarkDown_Menu = false"
              title="Close MarkUp Menu"
            >
              <svg
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
                <path d="M18 6L6 18"></path>
                <path d="M6 6l12 12"></path>
              </svg>
            </button>
            <!-- ///////////// -->
          </div>

          <div class="attachmentBtns" v-if="!Toggle_MarkDown_Menu">
            <label for="fileInput" class="custom_Choose_file" title="Attach File">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 1 24 24"
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

            <button
              class="MarkDownMenu"
              @click="
                Toggle_MarkDown_Menu = !Toggle_MarkDown_Menu;
                Front_Back_Camera = false;
              "
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 32 32"
                xmlns="http://www.w3.org/2000/svg"
              >
                <!-- Black background with gold border -->
                <rect
                  x="1"
                  y="1"
                  width="30"
                  height="30"
                  rx="6"
                  ry="6"
                  fill="none"
                  stroke="#FFD700"
                  stroke-width="2"
                />

                <!-- Left angled bracket -->
                <path
                  d="M10 8 L5 16 L10 24"
                  fill="none"
                  stroke="#FFD700"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />

                <!-- Right angled bracket -->
                <path
                  d="M22 8 L27 16 L22 24"
                  fill="none"
                  stroke="#FFD700"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />

                <!-- Center "A" -->
                <text
                  x="16"
                  y="20"
                  text-anchor="middle"
                  font-family="Georgia, serif"
                  fill="#FFD700"
                  font-weight="bold"
                >
                  A
                </text>
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
          name="Main_Note_Writing_Area"
          ref="focusOnInput"
          type="text"
          class="title"
          placeholder="Note Title"
          v-model="CurrentlyWritingTitle"
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
          <div
            name="notewriting"
            class="model_note"
            :class="{ empty: isEmpty }"
            ref="editor"
            :data-placeholder="placeholderText"
            contenteditable="true"
            @input="
              () => {
                updateActiveStates();
                checkPlaceholder();
              }
            "
            @mouseup="updateActiveStates"
            @keyup="updateActiveStates"
            @paste="paste"
          ></div>
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

          <div
            class="View_Text_In_UI View_Text_In_UI_Title"
            v-html="SendNoteForView_Title"
          ></div>
          <div
            ref="Note_View_UI_Text_Element"
            class="View_Text_In_UI"
            v-html="SendNoteForView_Message"
          ></div>

          <div class="media_in_note_view_ui">
            <div ref="Note_View_UI_Media_Container" class="media_in_note_view_ui_width">
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
import {
  ref,
  onMounted,
  watch,
  onUnmounted,
  computed,
  onBeforeUnmount,
  markRaw,
} from "vue";
import Dexie from "dexie";
import { debounce } from "lodash";
// .................................... All Variables .........................................
let isAddBtnPressed = ref(false);
/* let CurrentlyWritingMessage = ref(); */
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
let Toggle_MarkDown_Menu = ref(false);
let videoPreview = ref();
let overlayElement = ref();
let mediaRecorder = "";
let currentStream = ""; // Store the MediaStream object
let i = 0;
let j = 0;
let Max_Accumulated_Attachments_Size_Buffer = ref(20 * 1024 * 1024);
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
let Media = ref({ Video_Stop_Duration: 31000, Audio_Stop_Duration: 180000 });
let Toggle_Reading_Form_Full_Screen = ref(false);
let Total_Storage_Capacity = ref(null);
let Used_Storage_Capacity = ref(null);
let Used_Storage_Capacity_Percentage = ref(null);
let Used_Storage_Capacity_Element = ref();
let sort_order = ref("desc");
let Blur_Background_WhileOpening_Note = ref(false);
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
let Each_Note_Preview = ref();
let Note_View_UI_Media_Container = ref();
const db = new Dexie("MyNotesDB");
db.version(1).stores({
  notes: "id, note, createdAt, updatedAt",
  media: "id, blob, createdAt, updatedAt",
});
const refreshKey = ref(new Date().toISOString());
// Buttons

// All Methods.
import {
  bold,
  blockquote,
  italic,
  heading,
  link,
  copySmartContent,
  code,
  underline,
  striker,
  unorderedList,
  orderedList,
  textColor,
  highlight,
  undoAction,
  redoAction,
  Checkbox,
  isCheckboxSticky,
  handleEnterKey,
  editor,
  fill_both,
  paste,
  updatePreview,
} from "./components/Editor";

let BoldBtn = ref();
let ItalicBtn = ref();
let HeadingBtn = ref();
let CodeBtn = ref();
let QuoteBtn = ref();
let LinkBtn = ref();
let OrderListBtn = ref();
let UnorderListBtn = ref();
let UnderlineBtn = ref();
let StrikerBtn = ref();
let FontColorBtn = ref();
let HighlightBtn = ref();
let CheckboxBtn = ref();

const placeholderText = "Write Your Thoughts...";
let isEmpty = ref(true);

function checkPlaceholder() {
  const text = editor.value.innerText.trim() || editor.value.innerHTML.trim();
  isEmpty.value = text === "";
}

function getSelectedNode() {
  const sel = window.getSelection();
  if (!sel.rangeCount) return null;
  let node = sel.getRangeAt(0).commonAncestorContainer;
  return node.nodeType === 3 ? node.parentNode : node;
}

function updateActiveStates() {
  const selectionColor = document.queryCommandValue("foreColor");
  FontColorBtn.value?.classList.toggle(
    "Active_btn",
    selectionColor && selectionColor !== "rgb(255, 255, 255)"
  );

  const highlight =
    document.queryCommandValue("hiliteColor") || document.queryCommandValue("backColor");
  HighlightBtn.value?.classList.toggle(
    "Active_btn",
    highlight && highlight !== "transparent" && highlight !== "rgb(47, 47, 47)"
  );

  /*   UnderlineBtn.value?.classList.toggle("active", document.queryCommandState("underline")); */
  BoldBtn.value?.classList.toggle("Active_btn", document.queryCommandState("bold"));
  ItalicBtn.value?.classList.toggle("Active_btn", document.queryCommandState("italic"));
  UnderlineBtn.value?.classList.toggle(
    "Active_btn",
    document.queryCommandState("underline")
  );
  StrikerBtn.value?.classList.toggle(
    "Active_btn",
    document.queryCommandState("strikeThrough")
  );
  OrderListBtn.value?.classList.toggle(
    "Active_btn",
    document.queryCommandState("insertOrderedList")
  );
  UnorderListBtn.value?.classList.toggle(
    "Active_btn",
    document.queryCommandState("insertUnorderedList")
  );
  const node = getSelectedNode();
  HeadingBtn.value?.classList.toggle("Active_btn", node?.matches("h1,h2,h3,h4,h5,h6"));
  CodeBtn.value?.classList.toggle("Active_btn", !!node?.closest("pre"));
  QuoteBtn.value?.classList.toggle(
    "Active_btn",
    !!getSelectedNode()?.closest("blockquote")
  );
  LinkBtn.value?.classList.toggle("Active_btn", !!node?.closest("a"));

  /*   const isCheckbox = node?.tagName?.toLowerCase() === "input" && node.type === "checkbox";
  CheckboxBtn.value?.classList.toggle("Active_btn", isCheckbox); */
}

fill_both(getSelectedNode, updateActiveStates);

document.addEventListener("selectionchange", updateActiveStates);

onMounted(() => {
  updateActiveStates();
  editor.value.addEventListener("keydown", (event) => {
    if (handleEnterKey(event)) {
      event.preventDefault(); // Prevent default if handled
    }
  });
});

// .........................................All The Functions .....................................................

/* async function openDB(db) {
  try {
    if (!db.isOpen()) {
      await db.open();
      console.log("Dexie DB opened.");
    } else {
      console.log("Dexie DB already open.");
    }
  } catch (error) {
    console.error("Failed to open Dexie DB:", error);
  }
}


function closeDB(db) {
  try {
    db.close();
    console.log("Dexie DB closed.");
  } catch (error) {
    console.error("Failed to close Dexie DB:", error);
  }

demo usage:

 await openDB(db);
} */

function Toggle_Note_Card_Color_Mode() {
  try {
    let msg = "";
    Is_Sticky_Colorful_Card.value = !Is_Sticky_Colorful_Card.value;
    localStorage.setItem("Colorful_Notes", Is_Sticky_Colorful_Card.value);
    Is_Sticky_Colorful_Card.value
      ? (msg = "Colorful Notes Enabled - Your Next Notes Will Be Vibrant!")
      : (msg = "Standard Notes Active - New Notes Will Be Classic.");
    Show_Create_Edit_Model_Warning(msg, 5000);
  } catch (error) {
    console.log(error.message);
  }
}

const getCleanText = (text) =>
  !text
    ? ""
    : text
        // 1) Remove fenced code blocks
        .replace(/```([\s\S]*?)```/g, "$1")
        // 2) Remove inline code
        .replace(/`([^`]+)`/g, "$1")
        // 3) Remove headings (#)
        .replace(/^#{1,6}\s+/gm, "")
        // 4) Remove blockquotes (">")
        .replace(/^>\s?/gm, "")
        // 5) Remove horizontal rules
        .replace(/^(---|\*\*\*|___)$/gm, "")
        // 6) Remove combined bold+italic, bold, italic, strikethrough
        .replace(/(\*\*\*|___)(.*?)\1/g, "$2")
        .replace(/(\*\*|__)(.*?)\1/g, "$2")
        .replace(/(\*|_)(.*?)\1/g, "$2")
        .replace(/~~(.*?)~~/g, "$1")
        // 7) Remove Markdown links/images
        .replace(/\[([^\]]+)\]\(([^)]+)\)/g, "$1")
        .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, "$1")
        // 8) Remove custom [color] / [bg] tags
        .replace(/\[\/?(color|bg)(=[^\]]+)?\]/gi, "")
        // 9) Remove list markers at start of line
        .replace(/^\s*([-*+]|(\d+\.) )\s+/gm, "")
        // 10) Remove HTML tags
        .replace(/<[^>]*>/g, "")
        // 11) Remove table separator lines (e.g. "|:---|---:|")
        .replace(/^\s*:?-+:?\s*(\|\s*:?-+:?\s*)+$/gm, "")
        // 12) Remove table data/header lines (start with "|")
        .replace(/^\|.*?\|.*$/gm, "")
        // 13) clean # to n numbers
        .replace(/^#+\s*/gm, "")
        // 14) clan &xxx (next line)
        .replace(/&nbsp;/g, "")
        .replace(/&lt;/g, "")
        .replace(/h3&gt;/g, "")
        // 15) Trim & normalize spaces
        .trim()
        .replace(/\s\s+/g, " ");

const getShortText = (text) => {
  if (!text) return ""; // Handle null/undefined cases

  // Remove bold/italic/strikethrough, color, heading, bullet markers
  let clone_text = text;
  text = getCleanText(clone_text);
  const isFirefox = navigator.userAgent.toLowerCase().indexOf("firefox") > -1;
  const threshold =
    window.outerWidth <= 500 ? (isFirefox ? 95 : 110) : isFirefox ? 130 : 140;
  if (text.length > threshold) {
    return text.substring(0, threshold) + "...";
  } else {
    return text; // Return the full text if it doesn't exceed the threshold
  }
};

let Cancel_Operation = ref(false);

function abort_Controller() {
  try {
    if (Cancel_Operation.value) {
      console.log("aborted called");
      controller.abort();
      Cancel_Operation.value = false;
      resetController();
      return true;
    } else {
      return false;
    }
  } catch (error) {
    console.log(error.message);
  }
}

async function runAnimation(el) {
  try {
    if (abort_Controller()) return;
    console.log("calling animation method");
    await Lazy_Load_With_animation(el);
  } catch (error) {
    console.log(error.message);
  }
}

let vLoader = {
  async mounted(el, binding) {
    try {
      console.log("mounted");
      // Initially hide the media element
      el.style.transform = "scale(0)";
      if (el.tagName === "VIDEO") {
        el.nextSibling.style.transform = "scale(0)";
      }
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
    } catch (error) {
      console.log(error.message);
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
  try {
    if (abort_Controller()) return;
    console.log(
      el.previousElementSibling &&
        el.previousElementSibling.classList.contains("Upload_Loader_active_media")
    );
    if (
      el.previousElementSibling &&
      el.previousElementSibling.classList.contains("Upload_Loader_active_media")
    ) {
      el.previousElementSibling.style.transition = "opacity 0.2s ease";
      el.previousElementSibling.style.opacity = 0;
      await new Promise((resolve) => setTimeout(resolve, 200));
      el.previousElementSibling.style.display = "none";
    }
    await new Promise((resolve) => setTimeout(resolve, 10));
    if (abort_Controller()) return;
    el.style.transition = "transform 0.3s ease";
    el.style.transform = "scale(1)";
    /* enabling video overlay */
    if (el.tagName === "VIDEO") {
      el.nextSibling.style.transition = "transform 0.3s ease";
      el.nextSibling.style.transform = "scale(1)";
    }
  } catch (error) {
    console.log(error.message);
  }
}

// Helper: Delay function for sequential timing control.
//const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// --- Media Cleanup Helpers ---

// Revokes the object URL and resets the element's source.
function resetMediaElement(el) {
  try {
    if (el.tagName === "VIDEO" || el.tagName === "AUDIO") {
      if (!el.paused) {
        el.pause();
        el.currentTime = 0;
      }
      if (el.src) {
        URL.revokeObjectURL(el.src);
      }
      el.src = "";
      el.load();
    } else if (el.tagName === "IMG") {
      if (el.src) {
        URL.revokeObjectURL(el.src);
      }
      el.src = "";
    } else if (el.tagName === "A") {
      if (el.href) {
        URL.revokeObjectURL(el.href);
      }
      el.href = "";
    }
  } catch (error) {
    console.log("Error in resetMediaElement:", error.message);
  }
}

// Stops and cleans up all media elements stored in a global array.
async function stopAndCleanMedia(mediaArray) {
  try {
    if (mediaArray && mediaArray.value && mediaArray.value.length) {
      mediaArray.value.forEach((el) => resetMediaElement(el));
      mediaArray.value.splice(0, mediaArray.value.length);
      mediaArray.value.length = 0;
      mediaArray.value = [];
    }
  } catch (error) {
    console.log("Error in stopAndCleanMedia:", error.message);
  }
}

// Aggressive DOM media cleanup: scans for lingering media elements.
function nukeDOMMedia() {
  try {
    const selectors = ["video", "audio", "img", "a"];
    const zombieElements = document.querySelectorAll(selectors.join(","));
    zombieElements.forEach((el) => resetMediaElement(el));
    if (window.gc) window.gc(); // Force GC in Chrome if available.
  } catch (error) {
    console.log("Error in nukeDOMMedia:", error.message);
  }
}

// --- Data Link Cleanup Helpers ---

// Cleans a single array of blob-based links.
function cleanBlobLinks(arr) {
  try {
    arr.forEach((item) => {
      if (item.Data && typeof item.Data === "string" && item.Data.startsWith("blob")) {
        URL.revokeObjectURL(item.Data);
        item.Data = null;
      }
    });
    arr.splice(0, arr.length);
    arr.length = 0;
    arr = [];
  } catch (error) {
    console.log("Error in cleanBlobLinks:", error.message);
  }
}

// Cleans all media link arrays and decompressed media.
async function aggressiveLinkCleanup() {
  try {
    // Clean each media array.
    [SendImageForView, SendVideoForView, SendAudioForView, SendDocumentForView].forEach(
      (mediaArray) => {
        if (mediaArray && mediaArray.value && mediaArray.value.length) {
          cleanBlobLinks(mediaArray.value);
        }
      }
    );

    // Clean decompressed media if available.
    if (Decompressed_Media.value) {
      if (Decompressed_Media.value.Id) {
        terminateAllWorkers("view", Decompressed_Media.value.Id);
      }
      [
        Decompressed_Media.value.ImageFile,
        Decompressed_Media.value.VideoFiles,
        Decompressed_Media.value.AudioFiles,
        Decompressed_Media.value.DocumentFiles,
      ].forEach((arr) => {
        if (arr && arr.length) {
          cleanBlobLinks(arr);
        }
      });
      Decompressed_Media.value = null;
      resetController();
    }
  } catch (error) {
    console.log("Error in aggressiveLinkCleanup:", error.message);
  }
}

// --- UI Cleanup Helper ---

// Lowers opacity of media elements inside the provided container.
function fadeOutMediaElements(container) {
  try {
    if (!container) return;
    const classes = ["Upload_Loader_active_media", "video", "img", "audio", "document"];
    classes.forEach((className) => {
      container.querySelectorAll(`.${className}`).forEach((el) => (el.style.opacity = 0));
    });
  } catch (error) {
    console.log("Error in fadeOutMediaElements:", error.message);
  }
}

// Removes media elements from the note view depending on the event source.
async function removeNoteViewElements(event, location) {
  try {
    console.log("removeNoteViewElements invoked");
    let container = null;
    if (!event) {
      // Triggered by a back gesture.
      container = Note_View_UI_Media_Container.value;
    } else {
      container =
        location === "btn"
          ? event.target.parentElement.parentElement.parentElement
          : event.target.children[0].children[0].children[3];
    }
    fadeOutMediaElements(container);
  } catch (error) {
    console.log("Error in removeNoteViewElements:", error.message);
  }
}

// --- Main Close & Cleanup Function ---

function CloseBtn(event, original = "note_making", location) {
  try {
    if (original === "note_making") {
      // NOTE-MAKING MODE: Minimal UI changes and essential cleanup.
      if (EditMode.value) return;
      toggle_delete_model.value = false;
      isAddBtnPressed.value = false;
      CurrentIndex.value = null;
      stopRecording();
      Close_Video_Audio_Preview();
      Close_Btn_Sound.play();
      console.log("Closing note-making form");

      // Run only purgeObjectURLs and hyperClean in the background.
      (async () => {
        try {
          await Promise.all([purgeObjectURLs(), hyperClean(), stop_all_media()]);
          nukeDOMMedia();
          console.log("Note-making background cleanup complete.");
        } catch (bgError) {
          console.log("Error during note-making background cleanup:", bgError.message);
        }
      })();
    } else {
      // UI VIEW MODE: Immediate UI updates.
      console.log("Closing UI form");
      if (
        (SendImageForView.value && SendImageForView.value.length) ||
        (SendVideoForView.value && SendVideoForView.value.length) ||
        (SendAudioForView.value && SendAudioForView.value.length) ||
        (SendDocumentForView.value && SendDocumentForView.value.length)
      ) {
        console.log("UI form with media detected");
        Cancel_Operation.value = true;
        removeNoteViewElements(event, location);
        IsRoViewNoteOpen.value = false;
        setTimeout(() => {
          SendNoteForView_Title.value = null;
          SendNoteForView_Message.value = null;
        }, 400);
        Close_Btn_Sound.play();
      } else {
        console.log("UI form without media");
        IsRoViewNoteOpen.value = false;
        setTimeout(() => {
          SendNoteForView_Title.value = null;
          SendNoteForView_Message.value = null;
        }, 400);
        Close_Btn_Sound.play();
      }

      // Fire off all other cleanup tasks in the background.
      (async () => {
        try {
          await Promise.all([stopAndCleanMedia(media), aggressiveLinkCleanup()]);
          terminateAllWorkers("view");
          await Promise.all([purgeObjectURLs(), hyperClean()]);
          nukeDOMMedia();
          console.log("UI view background cleanup completed.");
        } catch (bgError) {
          console.log("Error during UI view background cleanup:", bgError.message);
        }
      })();
    }
    Cancel_Operation.value = false;
    if (document.body.classList.contains("disable_body_scroll_on_note_full_screen"))
      document.body.classList.remove("disable_body_scroll_on_note_full_screen");
    Blur_Background_WhileOpening_Note.value = false;
    console.log("closing blur");
    All_Storage_DS_Logs();
  } catch (error) {
    console.log("Error in CloseBtn:", error.message);
    // Fallback cleanup.
    stopRecording();
    Close_Video_Audio_Preview();
    purgeObjectURLs();
    stopAndCleanMedia(media);
    aggressiveLinkCleanup();
    hyperClean();
    terminateAllWorkers("view");
  }
}

// --- Additional Final Cleanups ---

function hyperClean() {
  try {
    if (window.gc) {
      // eslint-disable-next-line no-undef
      gc();
      // eslint-disable-next-line no-undef
      gc();
    }
  } catch (error) {
    console.log("Error in hyperClean:", error.message);
  }
}

function Toggle_Note_Full_Screen() {
  Toggle_Reading_Form_Full_Screen.value = !Toggle_Reading_Form_Full_Screen.value;
  document.body.classList.toggle("disable_body_scroll_on_note_full_screen");
}

function Remove_Video_Overlay(event) {
  try {
    event.target.classList.add("hide_video_overlay");
    setTimeout(() => event.target.remove(), 300);
    event.target.previousElementSibling.play();
  } catch (error) {
    console.log(error.message);
  }
}

// Call this function whenever you open a note to force a re-render.
function updateRefreshKey() {
  refreshKey.value = getSafeUUID();
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

        // Retrieve error count from localStorage (default to 0 if not present)
        let errorCount = parseInt(
          localStorage.getItem("Storage_Estimate_Error_Count") || "0",
          10
        );

        if (errorCount < 3) {
          // Increment the error counter and reload the page
          errorCount++;
          localStorage.setItem("Storage_Estimate_Error_Count", errorCount);
          window.location.reload();
        } else {
          // On the fourth failure or more, show critical error message
          Show_Critical_Error(
            "Unable to retrieve storage estimate, Please Reload The Page!"
          );
        }
        return;
      }

      // Reset error count on success
      localStorage.removeItem("Storage_Estimate_Error_Count");

      const usedGB = (estimate.usage / 1024 ** 3).toFixed(1);
      const totalGB = (estimate.quota / 1024 ** 3).toFixed(1);
      const percentage = ((estimate.usage / estimate.quota) * 100).toFixed(2);

      Used_Storage_Capacity.value = usedGB;
      Total_Storage_Capacity.value = totalGB;
      Used_Storage_Capacity_Percentage.value = percentage;

      if (Used_Storage_Capacity_Element.value) {
        Used_Storage_Capacity_Element.value.style.width = percentage + "%";
      }

      console.log(`Used: ${usedGB} GB`);
      console.log(`Total: ${totalGB} GB`);
      console.log(`Used Capacity: ${percentage}%`);
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

const workerRegistries = {
  save: new Map(),
  view: new Map(),
};

function terminateAllWorkers(type = null, ...ids) {
  try {
    // Convert provided IDs into a Set for fast lookup
    const idSet = new Set(ids);
    const registryTypes = type ? [type] : Object.keys(workerRegistries);

    console.log(`[WorkerManager] Termination request received.`);
    console.log(`- Type: ${type || "ALL"}`);
    console.log(`- Target IDs: ${ids.length > 0 ? [...idSet].join(", ") : "ALL"}`);

    registryTypes.forEach((registryType) => {
      const registry = workerRegistries[registryType];

      if (!registry) {
        console.warn(`[WorkerManager] Invalid worker type: ${registryType}. Skipping.`);
        return;
      }

      if (idSet.size > 0) {
        // Terminate only specified workers
        idSet.forEach((id) => {
          if (registry.has(id)) {
            terminateWorker(id, registryType);
          } else {
            console.warn(`[WorkerManager] Worker ID ${id} not found in ${registryType}.`);
          }
        });
      } else {
        // Terminate all workers in this category
        console.log(
          `[WorkerManager] Terminating all workers in category: ${registryType}`
        );
        for (const [id] of registry) {
          terminateWorker(id, registryType);
        }
      }
    });

    console.log("[WorkerManager] Worker termination process completed.");
  } catch (error) {
    console.error("[WorkerManager] Error terminating workers:", error.message);
  }
}

function terminateWorker(id, registryType) {
  try {
    const registry = workerRegistries[registryType];
    if (!registry || !registry.has(id)) {
      console.warn(`[WorkerManager] Worker ID ${id} not found in ${registryType}.`);
      return;
    }

    const worker = registry.get(id);
    console.log(`[WorkerManager] Terminating Worker ${id} of type ${registryType}...`);

    worker.postMessage({ command: "SUICIDE" });
    worker.terminate();
    registry.delete(id);

    console.log(`[WorkerManager] Worker ${id} successfully terminated.`);
  } catch (error) {
    console.error(`[WorkerManager] Error terminating Worker ${id}:`, error.message);
  }
}

// This function now returns a promise that resolves when the worker has processed the note.
function Decompresion_Worker(compressedNote, Is_Note) {
  return new Promise((resolve, reject) => {
    let newWorker;
    try {
      resetController();
      newWorker = new Worker(
        new URL("./components/decompression_worker.js", import.meta.url),
        {
          type: "module",
        }
      );
      const workerId = getSafeUUID();
      workerRegistries.view.set(workerId, newWorker);
      console.log("Worker created with ID:", workerId);

      console.log("Main sending compressed note to worker:", compressedNote);
      newWorker.postMessage({ Id: workerId, IsNote: Is_Note, Data: compressedNote }, [
        compressedNote.buffer,
      ]);
      compressedNote = null;

      newWorker.onmessage = function (e) {
        if (e.data.error) {
          console.log("Worker sent error:", e.data.error);
          // Reject the promise if the worker encountered an error.
          newWorker.terminate();
          terminateAllWorkers("view");
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
          resolve({ Id: e.data.Id, Data: e.data.note });
          e.data.note = null;
        }
      };
    } catch (error) {
      newWorker.terminate();
      terminateAllWorkers("view");
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
      title: updatePreview("## Welcome to Simple Colorful Notes"),
      userWrote: updatePreview(`
Explore a feature-rich note-taking experience with intuitive editing, detailed views, and seamless media attachments.

### Key Features
- **Create & Edit:** Write and modify your notes effortlessly.
- **View:** Tap on any note for a detailed display.
- **Delete:** Remove notes when they're no longer needed.
- **Attachments:** Easily add images, videos, audio files, and documents.

### Demo: Empty File
<pre class="code-block"><code>Title: [Your Note Title]
Content: Your note content appears here.
Attachments: No files attached yet.</code></pre>

> **Tip:** Start by creating your first note and experiment with the media options!

---

Enjoy using your app!`),
      NotesDate: formattedDate,
      isCardGoingDeleted: false,
      IsLoading: false,
      id: 10102,
      Card_Title_Color: "rgb(68 68 68)",
      Card_Para_Color: "rgb(46 46 46)",
      Card_Footer_Color: "rgb(68 68 68)",
      Attachment_Used_Size: Max_Accumulated_Attachments_Size.value,
      TimeStamp: new Date().toISOString(),
    };

    const demoSeeded = JSON.parse(localStorage.getItem("demoNoteSeeded"));
    const count = await db.notes.count();
    // Only seed if there are no notes AND we haven't seeded before.
    if (count === 0 && !demoSeeded) {
      data.value.push(Main_Sow_Case_Note);
      localStorage.setItem("demoNoteSeeded", "true");
      /*       await Post_Note(Main_Sow_Case_Note, null); */
      Compresion_Worker(Main_Sow_Case_Note, "note", "save");
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

let isFetchingNotes = ref(false);
async function fetchAllNotes() {
  let compressed_notes = null;
  let workerPromises = null;
  let results = null;
  let allWorkerIds = null;
  let query = null;
  try {
    if (isFetchingNotes.value) {
      console.log("Notes fetching is already in progress. Please wait.");
      return; // Exit if a fetch operation is already in progress
    }

    isFetchingNotes.value = true; // Set the flag to true
    console.log("Notes fetching in progress...");

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

    query = await db.notes.orderBy("createdAt").reverse();

    if (excludedIds.length > 0) {
      query = query.filter((note) => !excludedIds.includes(note.id));
    }

    compressed_notes = await query.offset(startIndex).limit(limitCount).toArray();

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
      isFetchingNotes.value = false;
      return;
    }

    Fetch_Notes_In_Parts.value.Start_From_Note++;

    workerPromises = compressed_notes.map((compressed_note) => {
      console.log("Sending note to worker:", compressed_note.note);
      return Decompresion_Worker(compressed_note.note, true);
    });

    // Wait until all workers have finished processing and pushed their results to the UI.
    results = await Promise.all(workerPromises);
    allWorkerIds = results.map((result) => {
      result.Data = null;
      return result.Id;
    });
    console.log("[Decompression] All workers completed. IDs:", allWorkerIds);
    terminateAllWorkers("view", ...allWorkerIds);

    PersistSort();

    More_Notes_Are_Coming.value = false;

    if (Fetch_Notes_In_Parts.value.Start_From_Note == 2) {
      Turn_Off_Loading_Screen();
    }
    console.log("Notes fetched successfully.");
  } catch (error) {
    console.error(error.message);
    ShowErrors(error);
    terminateAllWorkers("view");
    More_Notes_Are_Coming.value = false;
    Loading.value = false;
  } finally {
    isFetchingNotes.value = false; // Reset the flag in the `finally` block
    query = null;
    compressed_notes = null;
    workerPromises = null;
    results = null;
    allWorkerIds = null;
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
  try {
    media_object.value.id = null;
    const revokeAndClear = (array) => {
      console.log("reseting media holding arrays done ", array);
      array.splice(0, array.length); // Clear the array
      array.length = 0; // Reset the length to 0
      array = markRaw([]); // Reassign to an empty array
    };
    // Revoke URLs and clear each media array
    revokeAndClear(media_object.value.ImageFile);
    revokeAndClear(media_object.value.VideoFiles);
    revokeAndClear(media_object.value.AudioFiles);
    revokeAndClear(media_object.value.DocumentFiles);
    console.log("Media object reset and URLs revoked.", media_object.value);
  } catch (error) {
    console.log(error.message);
  }
}

/* async function Post_Note(note, media) {
  // Compress the note using the Web Worker
  let newNote = null;
  let compressedNote = null;
  let new_Note_Media = null;
  let compressedMedia = null;

  try {
    resetController();
    console.log("[Frontend] Preparing to compress the note...");

    // Ensure the note is valid before proceeding
    console.log(note);

    if (!note) {
      console.error("[Frontend] Invalid note data.");
      return;
    }

    // Destructure the response from the compression worker.
    compressedNote = await Compresion_Worker(note, "note");
    console.log("[Frontend] Note compressed successfully.", compressedNote);

    newNote = {
      id: note.id,
      note: compressedNote.Data,
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
      compressedMedia = await Compresion_Worker(media, "media");
      console.log("[Frontend] Note compressed successfully.", compressedMedia);

      new_Note_Media = {
        id: note.id,
        blob: compressedMedia.Data,
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
    console.log("All workers terminated and object URLs purged.");
    storage_capacity_checker();
  } catch (error) {
    stop_all_media();
    terminateAllWorkers("save");
    console.error("[Frontend] Error in Post_And_Notes:", error.message);
    // Optionally, display an error message to the user
    ShowErrors(error);
  } finally {
    console.log("cleaning in process...");
    Reset_Media_Object();
    terminateAllWorkers("save", compressedMedia.Id, compressedNote.Id);
    newNote = null;
    compressedNote = null;
    new_Note_Media = null;
    compressedMedia = null;
    note = null;
    media = null;
    purgeObjectURLs();
    console.log("All workers terminated and object URLs purged. Post method!");
  }
}

async function Update_Note(note, media) {
  let compressedNote = null;
  let updatedNote = null;
  let compressedMedia = null;
  let updatedMedia = null;
  let Is_Media_Exist_for_Note = null;

  try {
    resetController();
    console.log("[Frontend] Preparing to compress the note...");

    // Ensure the note is valid before proceeding
    console.log(note);

    if (!note) {
      console.error("[Frontend] Invalid note data.");
      return;
    }
    Is_Media_Exist_for_Note = await db.media.get(note.id);

    // Compress the note using the Web Worker
    compressedNote = await Compresion_Worker(note, "note");
    console.log("[Frontend] Note compressed successfully.", compressedNote.Data);

    updatedNote = {
      note: compressedNote.Data,
      updatedAt: new Date(),
    };

    compressedMedia = await Compresion_Worker(media, "media");
    console.log("[Frontend] Note compressed successfully.", compressedMedia.Data);
    updatedMedia = {
      blob: compressedMedia.Data,
      updatedAt: new Date(),
    };

    await db.transaction("rw", db.notes, db.media, async () => {
      await db.notes.update(note.id, updatedNote);
      if (Is_Media_Exist_for_Note) {
        if (updatedMedia) {
          await db.media.update(note.id, updatedMedia);
          console.log("updating the media");
        }
      } else {
        // Create new media entry if none exists
        await db.media.add({
          id: note.id,
          blob: compressedMedia.Data,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      }
      note.IsLoading = false;
    });
  } catch (error) {
    stop_all_media();
    terminateAllWorkers("save");
    console.error("[Frontend] Error in Update_Notes:", error.message);
    // Optionally, display an error message to the user
    ShowErrors(error);
  } finally {
    console.log("cleaning in process...");
    Reset_Media_Object();
    terminateAllWorkers("save", compressedNote.Id, compressedMedia.Id);
    compressedNote = null;
    updatedNote = null;
    compressedMedia = null;
    updatedMedia = null;
    Is_Media_Exist_for_Note = null;
    note = null;
    media = null;
    purgeObjectURLs();
    console.log("All workers terminated and object URLs purged. update method!");
    storage_capacity_checker();
  }
} */

function getSafeUUID() {
  try {
    if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
      return crypto.randomUUID();
    }
    return (
      "uuid-" + Date.now().toString(36) + "-" + Math.random().toString(36).substring(2)
    );
  } catch (error) {
    console.log(error.message);
  }
}

function Compresion_Worker(data, type, operation) {
  let worker;
  let mediaClone = null;
  let transferList = null;
  resetController();
  console.log("Sending note to worker ", data);

  try {
    worker = new Worker(new URL("./components/compression_worker.js", import.meta.url), {
      type: "module",
    });
    const workerId = getSafeUUID();
    console.log("Worker ID:", workerId);
    workerRegistries.save.set(workerId, worker);
    console.log("Worker created with ID:", workerId);

    // Send the note data to the worker for compression
    if (type == "note") {
      worker.postMessage({
        Id: workerId,
        Type: type,
        Data: JSON.stringify(data),
        Operation: operation,
      });
    } else if (type === "media") {
      mediaClone = deepCloneWithoutProxy(data);

      transferList = Object.values(mediaClone)
        .flat()
        .map((item) => item.Data)
        .filter((data) => data instanceof ArrayBuffer);

      worker.postMessage(
        { Id: workerId, Type: type, Media_Buffer: mediaClone, Operation: operation },
        transferList
      );
      Reset_Media_Object(); // Reset media object after sending
      data = null; // Clear data reference after sending
    } else {
      console.log("No type found from data in compression method main");
    }

    return new Promise((resolve, reject) => {
      worker.onmessage = (event) => {
        if (event.data.error) {
          console.error("[Frontend] Worker Compression Error:", event.data.error);
          worker.terminate(); // Clean up worker after task completion
          reject(event.data.error);
          Show_Critical_Error("Notes Compression Failed! Reload Page or Browser.");
          controller.abort();
        } else {
          console.log("Worker_finished Product ", event.data);
          worker.terminate(); // Clean up worker after task completion
          resolve({
            Operation: event.data.Operation,
            Type: event.data.Type,
            Status: event.data.status,
            Id: event.data.Id,
            id: event.data.id,
          }); // Compression successful
          if (event.data.id == 10102) {
            terminateAllWorkers("save", event.data.Id);
          }
          if (event.data.status == "success") {
            console.log("Compression successful");
          } else {
            console.log("Compression failed");
          }
        }
        data = null;
        event.data.Data = null;
      };

      worker.onerror = (error) => {
        console.error("[Frontend] Error in Web Worker:", error.message);
        reject(new Error(error.message)); // Handle generic worker errors
        Show_Critical_Error("Notes Compression Failed! Reload Page or Browser.");
        worker.terminate();
        controller.abort();
        stop_all_media();
        Reset_Media_Object();
        terminateAllWorkers("save");
        purgeObjectURLs();
        storage_capacity_checker();
        data = null;
      };
      data = null;
    });
  } catch (error) {
    console.log(error.message);
    Show_Critical_Error("Notes Compression Failed! Reload Page or Browser.");
    worker.terminate();
    controller.abort();
    stop_all_media();
    Reset_Media_Object();
    terminateAllWorkers("save");
    purgeObjectURLs();
    storage_capacity_checker();
    console.error("Error in Post_Update_Notes_Compression:", error.message);
    // Optionally, display an error message to the user
    ShowErrors(error);
  } finally {
    data = null;
    mediaClone = null;
    transferList = null;
  }
}

function deepCloneWithoutProxy(obj) {
  try {
    if (obj instanceof ArrayBuffer) return obj; // Preserve ArrayBuffer
    if (Array.isArray(obj)) return obj.map(deepCloneWithoutProxy);
    if (obj !== null && typeof obj === "object") {
      return Object.fromEntries(
        Object.entries(obj).map(([key, value]) => [key, deepCloneWithoutProxy(value)])
      );
    }
    return obj;
  } catch (error) {
    console.log(error.message);
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
    Close_Video_Audio_Preview();
    let Camera_Devices = ref([]);

    if (currentStream) {
      stopStream(currentStream);
      currentStream = null;
    }
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
        try {
          if (ctx) {
            ctx.save();
            ctx.scale(-1, 1); // horizontal flip
            ctx.drawImage(offscreenVideo, -canvas.width, 0, canvas.width, canvas.height);
            ctx.restore();
            animationFrameId = requestAnimationFrame(drawFrame);
          }
        } catch (error) {
          console.log(error.message);
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
  Close_Video_Audio_Preview();
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

let blob = ref(null);
let Video_Audio_Url = ref(null);
let Arr_Bfr = null;
// Save the recording
async function saveRecording() {
  try {
    let AudioStorageRef = EditMode.value ? Edit_Mode_AudioStorage : AudioStorage;
    let VideoStorageRef = EditMode.value ? Edit_Mode_VideoStorage : VideoStorage;

    blob.value = new Blob(recordedChunks.value, {
      type: supportedMime.value.replace(/,opus|,vorbis/g, ""),
    });
    recordedChunks.value.splice(0, recordedChunks.value.length); // releasing resouces
    recordedChunks.value.length = 0; // Reset the array
    recordedChunks.value = []; // Reassign to an empty array

    console.log("final blob--> ", blob.value);

    Video_Audio_Url.value = createTrackedObjectURL(blob.value);
    if (!Video_Audio_Url.value) Show_Critical_Error("Url Generation Failed ");
    console.log("url: ", Video_Audio_Url.value);

    Start_Video_Audio_Preview(blob.value, Video_Audio_Url.value);

    Arr_Bfr = await Blob_To_Array_Buffer(blob.value);

    if (blob.value.type.includes("audio")) {
      AudioStorageRef.value.push({
        name: `AudioRec_${++i}_Attached`,
        Data: Arr_Bfr,
        Type: "Video",
        Size: blob.value.size,
        timestamp: Date.now(),
        deletion: false,
      });
      editor.value.innerHTML += `<br><b>AudioRec_${i}_Attached</b>`;
      console.log("Audio recording saved.");
    } else if (blob.value.type.includes("video")) {
      VideoStorageRef.value.push({
        name: `VideoRec_${++j}_Attached`,
        Data: Arr_Bfr,
        Type: "Video",
        Size: blob.value.size,
        timestamp: Date.now(),
        deletion: false,
      });
      editor.value.innerHTML += `<br><b>VideoRec_${j}_Attached</b>`;
      console.log("Video recording saved.");
    } else {
      console.error("Unknown media type:", blob.value.type);
    }
    blob.value = null;
    Arr_Bfr = null;
  } catch (error) {
    console.log(error.message);
    blob.value = null;
    Arr_Bfr = null;
    URL.revokeObjectURL(Video_Audio_Url.value); // 🟢 Revoke on error
  }
}

function Blob_To_Array_Buffer(blob) {
  try {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsArrayBuffer(blob);
      reader.onloadend = () => resolve(reader.result); // reader.result is a arr bfr.
      reader.onerror = () => reject(new Error("Blob to Array Buffer Conversion Failed"));
    });
  } catch (error) {
    console.log(error.message);
  } finally {
    //blob = null;
  }
}

function Start_Video_Audio_Preview(blob, url) {
  try {
    Max_Accumulated_Attachments_Size.value -= blob.size;

    if (EditMode.value) {
      if (!Edit_Mode_Audio_Preview_Element.value) return;
      blob.type.includes("audio")
        ? (Edit_Mode_Toggle_Audio_Preview.value = true)
        : (Edit_Mode_Toggle_Video_Preview.value = true);
      setTimeout(() => {
        blob.type.includes("audio")
          ? (Edit_Mode_Audio_Preview_Element.value.src = url)
          : (Edit_Mode_Video_Preview_Element.value.src = url);
      }, 5);
    } else {
      if (!Done_Mode_Audio_Preview_Element.value) return;
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
    console.log("Revoking URL --> ", Video_Audio_Url.value);
    URL.revokeObjectURL(Video_Audio_Url.value);
    Video_Audio_Url.value = null;
    blob.value = null;
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
    return editor.value.innerHTML.replace(pattern, "").trim();
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
      editor.value.innerHTML = Cleaning(name);
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
      rawfile.readAsArrayBuffer(selectedFile);
    }

    rawfile.onloadend = () => {
      const fileType = selectedFile.type;
      const fileName = selectedFile.name;
      const fileSize = selectedFile.size;
      let fileData = rawfile.result;

      // If it's a text file, append its content to the writing message
      if (storageType === "text") {
        editor.value.innerText += fileData;
      }

      // Usage:
      if (["image", "video", "audio", "document"].includes(storageType)) {
        addMediaToStorage(storage, fileName, fileData, fileType, fileSize);
      }

      // Deduct the size of the added file from the max attachments size

      // Reset the file input to allow reselecting the same file in the future
      file.target.value = null;
      Max_Accumulated_Attachments_Size.value -= fileSize;
      URL.revokeObjectURL(fileData);
      fileData = null;
    };
  } catch (error) {
    console.log(error.message);
  }
}

function addMediaToStorage(storage, fileName, fileData, fileType, fileSize) {
  try {
    storage.value.push({
      name: fileName,
      Data: fileData,
      Type: fileType,
      Size: fileSize,
      timestamp: Date.now(),
      deletion: false,
    });
    editor.value.innerHTML += `<br><b>${fileName}</b>`;
    // reset
    URL.revokeObjectURL(fileData);
    fileData = null;
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
    if (temp_for_save_Create_Note_Text_if_available_parallelly.value.length) {
      CurrentlyWritingTitle.value =
        temp_for_save_Create_Note_Text_if_available_parallelly.value[0];
      editor.value.innerText =
        temp_for_save_Create_Note_Text_if_available_parallelly.value[1];
    }
    Create_Edit_Btn_Sound.play();
    /*     updatePreview(); */
    isAddBtnPressed.value = true;
    document.body.classList.add("disable_body_scroll_on_note_full_screen");
    Blur_Background_WhileOpening_Note.value = true;
  } catch (error) {
    console.log(error.message);
  }
}

async function Get_Media_from_Db(id) {
  let media = null;
  let Get_Decompressed_Media = null;
  try {
    media = await db.media.get(id); // Wait for the media to be fetched
    if (!media) {
      console.log("No media found");
      return null;
    }
    Get_Decompressed_Media = await Decompresion_Worker(media.blob, false); // Wait for processing
    console.log("Decompressed_Media ", Get_Decompressed_Media);
    return Get_Decompressed_Media;
  } catch (error) {
    console.log(error.message);
    return null;
  } finally {
    console.log(
      "Cleaning up media after get from database and decompressed it for RO_..."
    );
    media = null;
    Get_Decompressed_Media = null;
  }
}

function generateMediaURLs(mediaArray) {
  let blob = null;
  let url = null;
  try {
    mediaArray.forEach((media) => {
      if (media && media.Data instanceof ArrayBuffer) {
        // Create a Blob from the ArrayBuffer, using the provided Type if available.
        blob = new Blob([media.Data], {
          type: media.Type || "application/octet-stream",
        });
        // Create a URL from the Blob.
        url = createTrackedObjectURL(blob);
        // Nullify the Data property to free the memory.
        media.Data = null;
        media.Data = url;
      }
    });
    return mediaArray;
  } catch (error) {
    console.log(error.message);
  } finally {
    blob = null;
    url = null; // erase the copy url (points to blob);
  }
}

function make_checkbox_readonly(input) {
  return input.replace(/(<input\s+type="checkbox"[^>]*?)(>)/gi, "$1 data-readonly$2");
}

let Decompressed_Media = ref(null);
async function RO_ViewNotePage(index) {
  try {
    updateRefreshKey();
    Blur_Background_WhileOpening_Note.value = true;
    View_Btn_Sound.play();
    IsRoViewNoteOpen.value = true;
    SendNoteForView_Title.value = updatePreview(data.value[index].title);
    SendNoteForView_Message.value = updatePreview(
      make_checkbox_readonly(data.value[index].userWrote)
    );
    if (Toggle_Reading_Form_Full_Screen.value)
      document.body.classList.add("disable_body_scroll_on_note_full_screen");
    Decompressed_Media.value = await Get_Media_from_Db(data.value[index].id);

    if (Decompressed_Media.value) {
      if (Decompressed_Media.value.Data.ImageFile.length > 0)
        SendImageForView.value = generateMediaURLs(
          Decompressed_Media.value.Data.ImageFile
        );

      if (Decompressed_Media.value.Data.AudioFiles.length > 0)
        SendAudioForView.value = generateMediaURLs(
          Decompressed_Media.value.Data.AudioFiles
        );

      if (Decompressed_Media.value.Data.VideoFiles.length > 0)
        SendVideoForView.value = generateMediaURLs(
          Decompressed_Media.value.Data.VideoFiles
        );

      if (Decompressed_Media.value.Data.DocumentFiles.length > 0)
        SendDocumentForView.value = generateMediaURLs(
          Decompressed_Media.value.Data.DocumentFiles
        );
    }
  } catch (error) {
    purgeObjectURLs();
    nukeDOMMedia();
    await stopAndCleanMedia(media);
    await aggressiveLinkCleanup();
    terminateAllWorkers("view");
    console.log(error.message);
  }
}

async function EditBtn(index) {
  try {
    Toggle_MarkDown_Menu.value = false;
    Note_heading_element.value.textContent = "Edit Note";
    disable_color_notes_switcher_btn.value = false;
    /* inputData.value = ""; */
    Note_Createt_Close_btn.value.style.display = "none";
    Create_Edit_Btn_Sound.play();
    EditMode.value = true;
    Blur_Background_WhileOpening_Note.value = true;
    /////
    Save_The_Create_Notes_Max_Accu_Attachment_Capacity_While_Switching_To_Edit_Note.value =
      Max_Accumulated_Attachments_Size.value;
    if (editor.value.innerText || CurrentlyWritingTitle.value) {
      temp_for_save_Create_Note_Text_if_available_parallelly.value[0] =
        CurrentlyWritingTitle.value;
      temp_for_save_Create_Note_Text_if_available_parallelly.value[1] =
        editor.value.innerText;
    }
    Max_Accumulated_Attachments_Size.value = data.value[index].Attachment_Used_Size;

    console.log("testing--> MAX ", Max_Accumulated_Attachments_Size.value);
    console.log("testing--> Used Size ", data.value[index].Attachment_Used_Size);
    /////
    isEmpty.value = false;
    editor.value.innerHTML = data.value[index].userWrote;
    CurrentlyWritingTitle.value = data.value[index].title;
    /*     updatePreview(); */
    CurrentIndex.value = index;
    isAddBtnPressed.value = true;
    document.body.classList.toggle("disable_body_scroll_on_note_full_screen");
    /* Useful for edit mode like send all note data to array se delete buttons can acees it then modify & send it back to note*/
    if (EditMode.value) {
      let Pull_Decompressed_Media = await Get_Media_from_Db(data.value[index].id);
      console.log("Decompressed_Media ", Decompressed_Media);

      // Push items into edit mode arrays
      if (Pull_Decompressed_Media) {
        Pull_Decompressed_Media.Data.ImageFile.forEach((element) => {
          Edit_Mode_images.value.push(element);
          console.log("db note item ", element);
        });

        Pull_Decompressed_Media.Data.AudioFiles.forEach((element) => {
          Edit_Mode_AudioStorage.value.push(element);
          console.log("db note item ", element);
        });

        Pull_Decompressed_Media.Data.VideoFiles.forEach((element) => {
          Edit_Mode_VideoStorage.value.push(element);
          console.log("db note item ", element);
        });

        Pull_Decompressed_Media.Data.DocumentFiles.forEach((element) => {
          Edit_Mode_DocumentStorage.value.push(element);
          console.log("db note item ", element);
        });

        if (Pull_Decompressed_Media.Id) {
          terminateAllWorkers("view", Pull_Decompressed_Media.Id);
          Pull_Decompressed_Media.Id = null;
        }

        const mediaArrays = ["ImageFile", "AudioFiles", "VideoFiles", "DocumentFiles"];

        mediaArrays.forEach((key) => {
          const arr = Pull_Decompressed_Media.Data[key];
          console.log("edit mode cleaning key--> ", key);
          console.log("edit mode cleaning arr--> ", arr);
          if (Array.isArray(arr)) {
            arr.splice(0, arr.length); // Remove all elements
            Pull_Decompressed_Media.Data[key].length = 0; // Force clear again
            Pull_Decompressed_Media.Data[key] = []; // Drop reference for GC
          }
        });
      }

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

function getHTMLWithCheckedStates(editorEl) {
  const clone = editorEl.cloneNode(true);

  clone.querySelectorAll('input[type="checkbox"]').forEach((cb) => {
    if (cb.checked) {
      cb.setAttribute("checked", ""); // mark it checked
    } else {
      cb.removeAttribute("checked"); // ensure unchecked ones don’t carry a stale attribute
    }
    // (optional) make them read-only in view mode
    //cb.setAttribute("disabled", "");
  });

  return clone.innerHTML;
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
    setTimeout(() => {
      All_Storage_DS_Logs();
    }, 30000);
  } catch (error) {
    console.log(error.message);
  }
}

async function stop_all_media() {
  try {
    Toggle_MarkDown_Menu.value = false;
    if (document.body.classList.contains("disable_body_scroll_on_note_full_screen"))
      document.body.classList.remove("disable_body_scroll_on_note_full_screen");
    stopRecording();
    nukeDOMMedia();
    await aggressiveLinkCleanup();
    purgeObjectURLs();
    hyperClean();
  } catch (error) {
    console.log(error.message);
  }
}

async function Edit_Mode_Done_Btn() {
  try {
    if (!EditMode.value || CurrentIndex.value === undefined) {
      console.error("Edit mode is not active or currentIndex is undefined.");
      Show_Create_Edit_Model_Warning(
        "Cannot save: Edit mode not properly initialized.",
        1500
      );
      isAddBtnPressed.value = false; // Close the modal
      Blur_Background_WhileOpening_Note.value = false;
      await stop_all_media();
      Reset_Media_Object();
      purgeObjectURLs();
      storage_capacity_checker();
      return;
    }
    if (
      editor.value.innerText.trim() !== "" &&
      CurrentlyWritingTitle.value.trim() !== ""
    ) {
      // Capture the index locally
      const currentIndex = CurrentIndex.value;

      data.value[currentIndex].userWrote = getHTMLWithCheckedStates(editor.value);
      data.value[currentIndex].title = updatePreview(CurrentlyWritingTitle.value);
      editor.value.innerHTML = null;
      CurrentlyWritingTitle.value = null;
      let currentDate = new Date();
      let formattedDate = currentDate.toLocaleDateString();
      data.value[currentIndex].NotesDate = formattedDate;
      Close_Video_Audio_Preview();
      data.value[currentIndex].IsLoading = true;

      let edit_note_media_object = Working_Along_Side_With_Done_Btn(
        data.value[currentIndex].id
      );

      isAddBtnPressed.value = false;
      Blur_Background_WhileOpening_Note.value = false;
      data.value[currentIndex].Attachment_Used_Size =
        Max_Accumulated_Attachments_Size.value;
      Max_Accumulated_Attachments_Size.value =
        Save_The_Create_Notes_Max_Accu_Attachment_Capacity_While_Switching_To_Edit_Note.value;
      Note_Createt_Close_btn.value.style.display = "block";
      EditMode.value = false;
      disable_color_notes_switcher_btn.value = true;

      let response_note = null;
      let response_media = null;
      console.log("1. Note Object ", data.value[currentIndex]);
      console.log("2. sending note id to db", data.value[currentIndex].id);
      isEmpty.value = true;
      response_note = await Compresion_Worker(data.value[currentIndex], "note", "update");
      console.log("17. created note_media_object", edit_note_media_object);
      console.log("18. sending media to db?");
      if (
        edit_note_media_object &&
        (edit_note_media_object.ImageFile.length > 0 ||
          edit_note_media_object.VideoFiles.length > 0 ||
          edit_note_media_object.AudioFiles.length > 0 ||
          edit_note_media_object.DocumentFiles.length > 0)
      ) {
        console.log("18. sending media id to db", data.value[currentIndex].id);
        response_media = await Compresion_Worker(
          edit_note_media_object,
          "media",
          "update"
        );
        console.log("19. response_media ", response_media);
        console.log("20. response_note ", response_note);
      }
      console.log("21. finishing loading");
      data.value[currentIndex].IsLoading = false;
      edit_note_media_object = null;
      console.log("22. going to terminate after loading finished");
      terminateAllWorkers("save", response_note?.Id, response_media?.Id);
      console.log("23. terminated");
      await stop_all_media();
      console.log("24. stopped all media");
      Reset_Media_Object();
      console.log("25. reset media object");
      purgeObjectURLs();
      console.log("26. purged object urls");
      storage_capacity_checker();
      console.log("27. storage capacity checked");
    } else {
      Show_Create_Edit_Model_Warning("Please Fill Both Boxes.", 1500);
      return;
    }
  } catch (error) {
    console.log(error.message);
    await stop_all_media();
    Reset_Media_Object();
    terminateAllWorkers("save");
    purgeObjectURLs();
    storage_capacity_checker();
  }
}

let note_And_media_id = null;
async function Create_Note_Done_Btn() {
  try {
    if (
      editor.value.innerText.trim() !== "" &&
      CurrentlyWritingTitle.value.trim() !== ""
    ) {
      let currentDate = new Date();
      let formattedDate = currentDate.toLocaleDateString();
      let gettingColor = generateRandomColor();
      let result = gettingColor.slice(0, -5) + "1.0)";
      note_And_media_id = Date.now() + Math.floor(Math.random() * 1000000); // Unique ID

      //.................................. Object For Array To Make New Cards .................................
      Note_Object = {
        title: updatePreview(CurrentlyWritingTitle.value),
        userWrote: updatePreview(getHTMLWithCheckedStates(editor.value)),
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
      editor.value.innerHTML = null;
      CurrentlyWritingTitle.value = null;

      let create_note_media_object = Working_Along_Side_With_Done_Btn();

      //.............................................Here Pushing object To Array ................................
      Close_Video_Audio_Preview();
      isAddBtnPressed.value = false;
      Blur_Background_WhileOpening_Note.value = false;
      Max_Accumulated_Attachments_Size.value =
        Max_Accumulated_Attachments_Size_Buffer.value;
      temp_for_save_Create_Note_Text_if_available_parallelly.value.splice(
        0,
        temp_for_save_Create_Note_Text_if_available_parallelly.value.length
      );
      ///
      let response_note = null;
      let response_media = null;
      console.log("1. Note Object ", Note_Object);
      console.log("2. sending note id to db", note_And_media_id);

      response_note = await Compresion_Worker(Note_Object, "note", "save");
      if (
        create_note_media_object &&
        (create_note_media_object.ImageFile.length > 0 ||
          create_note_media_object.VideoFiles.length > 0 ||
          create_note_media_object.AudioFiles.length > 0 ||
          create_note_media_object.DocumentFiles.length > 0)
      ) {
        console.log("17. create_note_media_object", create_note_media_object);
        console.log("18. sending media id to db", note_And_media_id);

        response_media = await Compresion_Worker(
          create_note_media_object,
          "media",
          "save"
        );
      }
      console.log("19. response_note ", response_note);
      console.log("20. response_media ", response_media);
      console.log("21. finishing loading");
      data.value[data.value.findIndex((n) => n.id == response_note.id)].IsLoading = false;
      create_note_media_object = null;
      Newly_Created_Notes_Id_For_Backend_To_Avoid_Send_Them_During_pagination.value.push(
        note_And_media_id
      );
      console.log("22. going to terminate after loading finished");
      terminateAllWorkers("save", response_note?.Id, response_media?.Id);
      console.log("23. terminated");
      await stop_all_media();
      console.log("24. stopped all media");
      Reset_Media_Object();
      console.log("25. reset media object");
      purgeObjectURLs();
      console.log("26. purged object urls");
      storage_capacity_checker();
      console.log("27. storage capacity checked");
      /*       stop_all_media(); */
    }
    //..............................Error If It Found Inputs Fields Are Empty .....................................
    else {
      Show_Create_Edit_Model_Warning("Please Fill Both Boxes.", 1500);
      return;
    }
  } catch (error) {
    console.log("Error in Create_Note_Done_Btn: ", error.message);
    console.log(error.message);
    await stop_all_media();
    Reset_Media_Object();
    terminateAllWorkers("save");
    purgeObjectURLs();
    storage_capacity_checker();
  }
}

let media_object = ref({
  id: null,
  ImageFile: markRaw([]), // Array itself is non-reactive
  AudioFiles: markRaw([]),
  VideoFiles: markRaw([]),
  DocumentFiles: markRaw([]),
});

/////////
function Working_Along_Side_With_Done_Btn(edit_mode_note_id) {
  try {
    const updateAndClearStorage = (source, target) => {
      source.forEach((item) => {
        console.log("Loop items ", item);
        target.push(markRaw(item));
        console.log("Target ", target);
      });
      source.splice(0, source.length); // Clear the source after transfer
      source.length = 0; // Force clear again
      source = []; // Drop reference for GC
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
function Handle_Keyboard_Events() {
  try {
    Note_Making_UI_Element.value.addEventListener("keyup", (event) => {
      if (event.key === "Escape") {
        CloseBtn(null, "note_making", null);
      }
    });

    note_view_ui_element.value.addEventListener("keyup", (event) => {
      if (event.key === "Escape") {
        CloseBtn(null, null, "ovl");
      }
    });

    focusOnInput.value.addEventListener("keyup", (event) => {
      if (event.key === "Enter") {
        editor.value.focus(); // Shift focus to the note input box
      } else if (event.key == "Enter" && event.shiftKey) {
        DoneBtn();
      }
    });

    editor.value.addEventListener("keyup", (event) => {
      if (event.key == "Enter" && event.shiftKey) {
        DoneBtn();
      }
    });
  } catch (error) {
    console.log(error.message);
  }
}

let Making_Debounce = debounce(SearchBtnLogic, 200);

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
    videoPreview.value.style.width = editor.value.offsetWidth + "px"; // Append "px"
    videoPreview.value.style.height = editor.value.offsetHeight + "px"; // Append "px"
  } catch (error) {
    console.log(error.message);
  }
}

AdjustCameraScreenSize();

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

const urlRegistry = new Map();

function createTrackedObjectURL(blob) {
  let url = null;
  try {
    url = URL.createObjectURL(blob);
    console.log("url created by main ", url);
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
      console.log(`Object blob and URL revoked: ${url}`);
    });
    urlRegistry.clear();
    console.log("All object URLs purged.");
  } catch (error) {
    console.error("Failed to purge object URLs:", error.message);
  }
}

// Add memory guard to critical functions
async function memoryGuard() {
  try {
    if (Used_Storage_Capacity_Percentage.value > 90) {
      Show_Critical_Error(`Warning! Storage Will Auto Erase Above 95% Usage.`);
    }
    if (Used_Storage_Capacity_Percentage.value > 95) {
      Show_Critical_Error(`Warning! 95% Limit Reached, Erasing Storage Started`);
      terminateAllWorkers();
      purgeObjectURLs();
      nukeDOMMedia();
      await aggressiveLinkCleanup();
      db.delete();
      location.reload(); // Nuclear option
    }
  } catch (error) {
    console.log(error.message);
  }
}
// Run periodically
setInterval(memoryGuard, 300000);

function Manage_Model_Using_Ui_gesture() {
  try {
    console.log("fired...");
    if (isAddBtnPressed.value) {
      CloseBtn(null, "note_making", null);
      return true;
    } else if (IsRoViewNoteOpen.value) {
      CloseBtn(null, null, null);
      return true;
    } else if (inputData.value.length > 0) {
      reset_searchbar();
      return true;
    } else {
      return false;
    }
  } catch (error) {
    console.log(error.message);
  }
}

function handlePopState() {
  try {
    // If any UI element is open, close it and push state back to prevent route change
    if (Manage_Model_Using_Ui_gesture()) {
      console.log("fire in");
      history.pushState(null, document.title, window.location.href);
    } else {
      if (window.location.pathname === "/") {
        console.log("default");
        /* empty */
      }
    }
  } catch (error) {
    console.log(error.message);
  }
}

onBeforeUnmount(() => {
  window.removeEventListener("popstate", handlePopState);
});

onMounted(async () => {
  console.log("App mounted");
  terminateAllWorkers("save");
  terminateAllWorkers("view");
  purgeObjectURLs();
  nukeDOMMedia();
  stopRecording();
  await aggressiveLinkCleanup();
  history.pushState(null, document.title, window.location.href);
  window.addEventListener("popstate", handlePopState);
  Handle_Keyboard_Events();
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
  storage_capacity_checker();
  change_text_alignment();
  /* updatePreview(); */
  window.addEventListener("scroll", debouncedScroll);
});

onUnmounted(async () => {
  All_Storage_DS_Logs();
  db.tables.forEach((table) => {
    if (typeof table.close() === "function") table.close();
  });
  Dexie.delete("MyNotesDB"); // Force close
  data.value = [];
  media_object.value = null;
  Decompressed_Media.value = null;
  stopRecording();
  nukeDOMMedia();
  await aggressiveLinkCleanup();
  db.close();
  stopStream(currentStream);
  window.removeEventListener("popstate", handlePopState);
  document.removeEventListener("keydown", Scroll_Control);
  document.removeEventListener("Keyup", Scroll_Control);
  clearTimeout(debounceTimeout); // Add timeout cleanup
  window.removeEventListener("scroll", debouncedScroll); // 🟢 Add this
  window.removeEventListener("resize", AdjustCameraScreenSize);
  terminateAllWorkers();
  purgeObjectURLs();
  terminateAllWorkers("save");
  terminateAllWorkers("view");
  controller.abort();
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

function All_Storage_DS_Logs() {
  console.groupCollapsed("=== Storage & Workers Dump ===");

  // 1) Generic array logs
  [
    ["recordedChunks", recordedChunks.value],
    ["images", images.value],
    ["AudioStorage", AudioStorage.value],
    ["VideoStorage", VideoStorage.value],
    ["DocumentStorage", DocumentStorage.value],
  ].forEach(([name, arr]) => console.log(`${name} [${arr.length}]`, arr));

  // 2) Edit‑mode arrays
  console.group("Edit‑Mode Storages");
  [
    ["images", Edit_Mode_images.value],
    ["AudioStorage", Edit_Mode_AudioStorage.value],
    ["VideoStorage", Edit_Mode_VideoStorage.value],
    ["DocumentStorage", Edit_Mode_DocumentStorage.value],
  ].forEach(([name, arr]) => console.log(`${name} [${arr.length}]`, arr));
  console.groupEnd();

  // 3) View arrays
  console.group("View Storages");
  [
    ["SendImageForView", SendImageForView.value],
    ["SendAudioForView", SendAudioForView.value],
    ["SendVideoForView", SendVideoForView.value],
    ["SendDocumentForView", SendDocumentForView.value],
  ].forEach(([name, arr]) => console.log(`${name} [${(arr || []).length}]`, arr));
  console.groupEnd();

  // 4) media_object tables
  console.group("media_object");
  console.table(media_object.value.ImageFile);
  console.table(media_object.value.AudioFiles);
  console.table(media_object.value.VideoFiles);
  console.table(media_object.value.DocumentFiles);
  console.groupEnd();

  // 5) URL registry
  console.group("urlRegistry");
  urlRegistry.forEach((meta, url) => console.log(url, "→", meta));
  console.groupEnd();

  // 6) Worker registries
  console.group("workerRegistries.save");
  workerRegistries.save.forEach((worker, id) => console.log(id, worker));
  console.groupEnd();
  console.group("workerRegistries.view");
  workerRegistries.view.forEach((worker, id) => console.log(id, worker));
  console.groupEnd();

  // 7) Your new variables
  console.group("Additional Variables");
  console.log("blob:", blob.value);
  console.log("Video_Audio_Url:", Video_Audio_Url.value);
  console.log("Arr_Bfr:", Arr_Bfr);
  console.groupEnd();

  console.groupEnd(); // end root
}

// User Data.
let data = ref([]);
</script>
