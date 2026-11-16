// Floating-label text field (ANIMATION-SPEC C1 step 1): the label sits inside the field and moves up when
// the field is focused or filled (`placeholder=" "` + :placeholder-shown). Used by Contact and the Events brand preview.
export const FIELD_INPUT =
  "peer h-[60px] w-full rounded-m border border-line bg-white px-4 pt-6 pb-2 text-[16px] outline-none [transition:border-color_.3s,box-shadow_.3s] focus:border-blue focus:shadow-[0_0_0_3px_var(--color-blue-soft)]";
export const FIELD_LABEL =
  "pointer-events-none absolute top-[19px] left-[17px] origin-top-left text-[16px] text-stone [transition:transform_.45s_var(--e-out),color_.3s] peer-focus:text-blue-deep peer-focus:[transform:translateY(-11px)_scale(.76)] peer-[:not(:placeholder-shown)]:text-blue-deep peer-[:not(:placeholder-shown)]:[transform:translateY(-11px)_scale(.76)]";
