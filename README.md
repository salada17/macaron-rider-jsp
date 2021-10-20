# 마카롱 M - 웹 퍼블리싱
> 라이더 앱 기존 웹뷰 페이지(JSP) 관련 퍼블리싱 작업   


## 개발환경
Nothing.
PURE HTML



## 폴더구조

  ```
  ├── resources
  │   ├── js                  // 스크립트 폴더
  │   ├── img                 // 이미지 폴더
  │   └── css                 // 스타일 폴더
  ├── WEB-INF
  |   └──  views               // 이벤트 화면  
  │        └──  html              // 공지사항  
  │             ├── ...                 
  │             └── (화면단위)            
  ├── ~~~~
  ~~~~

  ```

---

## 브랜치 규칙

- 브랜치 종류
  - master: 메인 유지관리 브랜치 릴리즈 시 태깅추가, 운영환경
  - develop: 실행 가능한, 에러 없는 최신 소스, 개발자 공유
  - feature/{feature name} : 개발항목 구

- 브랜치 [그래프][1] 예)

  ```
               hotfix/QA_#11---
               /                \
  -  master ------------------------------(merge & taging)
         \                                     /
	       develop ------------------------(merge)-----
	          \                            /
               --- feature/m-second(localPC)------

  ```
 - 개발 작업 순서
 1. local PC에 develop 에서 소스를 당겨 온다. (clone)
 2. feature 항목 branch를 만든다. (예. feature/m-first, feature/card)
 3. 개발 작업 수행
 4. 로컬에 commit 한다.
 5. 원격에 push 한다.
 6. Merge Request를 생성한다. (리뷰요청)
 7. 리뷰를 기다린다. (리뷰어는 리뷰 후 머지 한다.)
 7-1. 컨플릭이 발생한 경우 개발담당자가 수정 후 Push 한다.
 8. 머지가 완료된 후 코멘트로 Develop 브랜치가 업데이트 된 것을 알린다.

 - Feature브랜치를 중심을 수시로 develop 브랜치를 당겨서 머지해야 나중에 충돌해결하는데 어려움이 없다.


[1]:https://repo.macaron.mobi/kstm/mobile/macaron_rider_ios/-/network/master
