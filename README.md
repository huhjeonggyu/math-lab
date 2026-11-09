# 수학 실험실 · Math Lab

수열과 급수, 테일러와 푸리에를 움직이는 그래프로 탐구하는 수업용 웹사이트.

**사이트:** https://huhjeonggyu.github.io/math-lab/

## 실험실

- **수열과 급수** (`docs/labs/sequences/`): 8개 예제에서 항 `a_n`과 부분합 `S_n`을 나란히 비교합니다. 재생, 한 항씩 진행, 관찰 범위, ε 수렴 띠를 지원합니다.
- **테일러와 푸리에** (`docs/labs/taylor/`): 6개 급수의 부분합과 비교 함수를 함께 그리고, 수렴 구간과 선택한 점의 오차를 확인합니다.

HTML, CSS, JavaScript ES modules, Canvas, MathML만 사용합니다. 실행에 외부 라이브러리, 계정, API 키가 필요하지 않습니다. 계산은 방문자의 브라우저에서 수행합니다.

## 로컬 실행

```sh
python -m http.server 8000 --directory docs
```

브라우저에서 http://localhost:8000 을 엽니다. ES module 때문에 HTML을 직접 더블클릭하지 말고 HTTP 서버로 실행합니다.

## 확인

```sh
node tests/sequences.test.mjs
node tests/taylor.test.mjs
node tests/site.test.mjs
```

## GitHub Pages

저장소의 **Settings → Pages**에서 다음과 같이 한 번 설정합니다.

- Source: **Deploy from a branch**
- Branch: **main**
- Folder: **/docs**
- **Save**

이후 `main`의 `docs/` 변경 사항은 자동으로 배포됩니다. `docs/.nojekyll`을 포함하며 별도 빌드 과정은 없습니다. 배포가 끝난 뒤 실제 사이트가 열리는지 확인합니다.

## 편집 구조

```text
docs/
  index.html          # 공통 첫 화면
  assets/             # 첫 화면 스타일, 애니메이션, 아이콘
  labs/sequences/     # 수열과 급수 실험실
  labs/taylor/        # 테일러와 푸리에 실험실
tests/                # 수학 계산 및 사이트 경로 확인
```

수학 계산은 각 실험실의 `math.mjs`, 화면 동작은 `app.mjs`에 있습니다. 링크와 자산 경로는 프로젝트 하위 경로에서도 동작하도록 상대 경로로 지정했습니다.

## 수학적 표현

- 그래프는 실제 정수 항 개수의 부분합을 표시합니다. 수렴 판정은 유한한 그림만으로 주장하지 않고 설명을 함께 제공합니다.
- ε 띠의 기준 인덱스는 충분조건이며 가장 작은 값이라고 주장하지 않습니다.
- 교대조화급수는 조건수렴이고, `1 − 1 + 1 − 1 + …`은 보통의 부분합 정의에서 발산합니다.
- 숫자는 반올림하여 표시합니다. 운영체제의 움직임 줄이기 설정을 따릅니다.
